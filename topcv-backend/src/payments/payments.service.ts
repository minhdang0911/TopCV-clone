import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PLAN_CONFIG } from '../common/plan-limits';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private hmac256(data: string, secret: string) {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  private hmac512(data: string, secret: string) {
    return crypto.createHmac('sha512', secret).update(data).digest('hex');
  }

  private generateOrderId(prefix: string) {
    return `${prefix}${Date.now()}`;
  }

  // ─── Create ────────────────────────────────────────────────────────────────

  async create(userId: string, plan: string, gateway: string) {
    const planUp = plan.toUpperCase();
    const planCfg = PLAN_CONFIG[planUp];
    if (!planCfg) throw new ForbiddenException('Gói không hợp lệ');

    const gwUp = gateway.toUpperCase();
    const orderId = this.generateOrderId(`TOPCV${gwUp.slice(0, 2)}`);

    await this.prisma.payment.create({
      data: { userId, gateway: gwUp, orderId, amount: planCfg.amount, plan: planUp },
    });

    if (gwUp === 'MOMO') return this.createMoMo(orderId, planCfg);
    if (gwUp === 'ZALOPAY') return this.createZaloPay(orderId, planCfg);
    if (gwUp === 'VNPAY') return this.createVNPay(orderId, planCfg);
    throw new ForbiddenException('Cổng thanh toán không hợp lệ');
  }

  private async createMoMo(orderId: string, planCfg: any) {
    const partnerCode = this.config.get('MOMO_PARTNER_CODE');
    const accessKey = this.config.get('MOMO_ACCESS_KEY');
    const secretKey = this.config.get('MOMO_SECRET_KEY');
    const redirectUrl = this.config.get('MOMO_REDIRECT_URL');
    const ipnUrl = this.config.get('MOMO_IPN_URL');
    const endpoint = this.config.get('MOMO_ENDPOINT');

    const requestType = 'payWithMethod';
    const extraData = '';
    const rawSig = `accessKey=${accessKey}&amount=${planCfg.amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${planCfg.label}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${orderId}&requestType=${requestType}`;
    const signature = this.hmac256(rawSig, secretKey);

    const res = await fetch(`${endpoint}/v2/gateway/api/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerCode, accessKey, requestId: orderId, amount: planCfg.amount,
        orderId, orderInfo: planCfg.label, redirectUrl, ipnUrl,
        lang: 'vi', requestType, autoCapture: true, extraData, signature,
      }),
    });
    const data = await res.json() as any;
    return { orderId, payUrl: data.payUrl, gateway: 'MOMO' };
  }

  private async createZaloPay(orderId: string, planCfg: any) {
    const appId = parseInt(this.config.get<string>('ZALOPAY_APP_ID') ?? '0');
    const key1 = this.config.get('ZALOPAY_KEY1');
    const redirectUrl = this.config.get('ZALOPAY_REDIRECT_URL');
    const callbackUrl = this.config.get('ZALOPAY_IPN_URL');
    const endpoint = this.config.get('ZALOPAY_ENDPOINT');

    const appTime = Date.now();
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const appTransId = `${yy}${mm}${dd}_${orderId}`;

    const embedData = JSON.stringify({ redirecturl: redirectUrl });
    const item = JSON.stringify([{ itemid: 'plan', itemname: planCfg.label, itemprice: planCfg.amount, itemquantity: 1 }]);

    const mac = this.hmac256(`${appId}|${appTransId}|topcv_user|${planCfg.amount}|${appTime}|${embedData}|${item}`, key1);

    const res = await fetch(`${endpoint}/v2/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: appId, app_trans_id: appTransId, app_user: 'topcv_user',
        app_time: appTime, amount: planCfg.amount, item, embed_data: embedData,
        description: planCfg.label, callback_url: callbackUrl, mac,
      }),
    });
    const result = await res.json() as any;

    await this.prisma.payment.update({ where: { orderId }, data: { gatewayData: { appTransId } } });
    return { orderId, payUrl: result.order_url, gateway: 'ZALOPAY' };
  }

  private createVNPay(orderId: string, planCfg: any) {
    const tmnCode = this.config.get('VNPAY_TMN_CODE');
    const hashSecret = this.config.get('VNPAY_HASH_SECRET');
    const vnpUrl = this.config.get('VNPAY_URL');
    const returnUrl = this.config.get('VNPAY_RETURN_URL');

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const createDate = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const params: Record<string, string> = {
      vnp_Version: '2.1.0', vnp_Command: 'pay', vnp_TmnCode: tmnCode,
      vnp_Amount: String(planCfg.amount * 100), vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND', vnp_IpAddr: '127.0.0.1', vnp_Locale: 'vn',
      vnp_OrderInfo: planCfg.label, vnp_OrderType: 'other',
      vnp_ReturnUrl: returnUrl, vnp_TxnRef: orderId,
    };

    const sorted = Object.keys(params).sort().reduce((acc, k) => ({ ...acc, [k]: params[k] }), {} as Record<string, string>);
    const signData = new URLSearchParams(sorted).toString();
    const signature = this.hmac512(signData, hashSecret);

    return { orderId, payUrl: `${vnpUrl}?${signData}&vnp_SecureHash=${signature}`, gateway: 'VNPAY' };
  }

  // ─── Poll status ────────────────────────────────────────────────────────────

  async getStatus(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) return { status: 'NOT_FOUND' };
    if (payment.status === 'SUCCESS') return { status: 'SUCCESS', plan: payment.plan };
    if (payment.status === 'FAILED') return { status: 'FAILED' };

    let gwStatus: 'SUCCESS' | 'FAILED' | 'PENDING';
    try {
      if (payment.gateway === 'MOMO') gwStatus = await this.queryMoMo(payment);
      else if (payment.gateway === 'ZALOPAY') gwStatus = await this.queryZaloPay(payment);
      else return { status: 'PENDING' }; // VNPay handled via verifyVNPay
    } catch {
      return { status: 'PENDING' };
    }

    if (gwStatus === 'SUCCESS') {
      await this.activatePlan(payment);
      return { status: 'SUCCESS', plan: payment.plan };
    }
    if (gwStatus === 'FAILED') {
      await this.prisma.payment.update({ where: { orderId }, data: { status: 'FAILED' } });
      return { status: 'FAILED' };
    }
    return { status: 'PENDING' };
  }

  private async queryMoMo(payment: any): Promise<'SUCCESS' | 'FAILED' | 'PENDING'> {
    const partnerCode = this.config.get('MOMO_PARTNER_CODE');
    const accessKey = this.config.get('MOMO_ACCESS_KEY');
    const secretKey = this.config.get('MOMO_SECRET_KEY');
    const endpoint = this.config.get('MOMO_ENDPOINT');

    const rawSig = `accessKey=${accessKey}&orderId=${payment.orderId}&partnerCode=${partnerCode}&requestId=${payment.orderId}`;
    const signature = this.hmac256(rawSig, secretKey);

    const res = await fetch(`${endpoint}/v2/gateway/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerCode, orderId: payment.orderId, requestId: payment.orderId, lang: 'vi', signature }),
    });
    const data = await res.json() as any;
    if (data.resultCode === 0) return 'SUCCESS';
    if ([1000, 7000, 7002, 9000].includes(data.resultCode)) return 'PENDING';
    return 'FAILED';
  }

  private async queryZaloPay(payment: any): Promise<'SUCCESS' | 'FAILED' | 'PENDING'> {
    const appId = this.config.get('ZALOPAY_APP_ID');
    const key1 = this.config.get('ZALOPAY_KEY1');
    const endpoint = this.config.get('ZALOPAY_ENDPOINT');

    const appTransId = (payment.gatewayData as any)?.appTransId;
    if (!appTransId) return 'PENDING';

    const mac = this.hmac256(`${appId}|${appTransId}|${key1}`, key1);
    const res = await fetch(`${endpoint}/v2/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: parseInt(appId), app_trans_id: appTransId, mac }),
    });
    const result = await res.json() as any;
    if (result.return_code === 1) return 'SUCCESS';
    if (result.return_code === 3) return 'PENDING';
    return 'FAILED';
  }

  // ─── MoMo confirm redirect ─────────────────────────────────────────────────

  async confirmMoMo(userId: string, params: Record<string, string>) {
    const accessKey = this.config.get('MOMO_ACCESS_KEY');
    const secretKey = this.config.get('MOMO_SECRET_KEY');
    const { signature, ...rest } = params;

    const rawSig = [
      `accessKey=${accessKey}`,
      `amount=${rest.amount}`,
      `extraData=${rest.extraData ?? ''}`,
      `message=${rest.message ?? ''}`,
      `orderId=${rest.orderId}`,
      `orderInfo=${rest.orderInfo ?? ''}`,
      `orderType=${rest.orderType ?? ''}`,
      `partnerCode=${rest.partnerCode}`,
      `payType=${rest.payType ?? ''}`,
      `requestId=${rest.requestId}`,
      `responseTime=${rest.responseTime ?? ''}`,
      `resultCode=${rest.resultCode}`,
      `transId=${rest.transId ?? ''}`,
    ].join('&');
    const expected = this.hmac256(rawSig, secretKey);

    if (signature !== expected) return { status: 'INVALID_SIGNATURE' };

    const orderId = rest.orderId;
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) return { status: 'NOT_FOUND' };
    if (payment.userId !== userId) return { status: 'FORBIDDEN' };
    if (payment.status === 'SUCCESS') return { status: 'SUCCESS', plan: payment.plan };

    if (rest.resultCode === '0') {
      await this.activatePlan(payment);
      return { status: 'SUCCESS', plan: payment.plan };
    }

    await this.prisma.payment.update({ where: { orderId }, data: { status: 'FAILED' } });
    return { status: 'FAILED' };
  }

  // ─── ZaloPay confirm redirect ──────────────────────────────────────────────

  async confirmZaloPay(userId: string, params: Record<string, string>) {
    const orderId = params.apptransid
      ? await this.findOrderByAppTransId(params.apptransid)
      : params.orderId;

    if (!orderId) return { status: 'NOT_FOUND' };
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) return { status: 'NOT_FOUND' };
    if (payment.userId !== userId) return { status: 'FORBIDDEN' };
    if (payment.status === 'SUCCESS') return { status: 'SUCCESS', plan: payment.plan };

    if (params.status === '1') {
      await this.activatePlan(payment);
      return { status: 'SUCCESS', plan: payment.plan };
    }

    await this.prisma.payment.update({ where: { orderId }, data: { status: 'FAILED' } });
    return { status: 'FAILED' };
  }

  private async findOrderByAppTransId(appTransId: string): Promise<string | null> {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayData: { path: ['appTransId'], equals: appTransId } },
      select: { orderId: true },
    });
    return payment?.orderId ?? null;
  }

  // ─── VNPay verify ──────────────────────────────────────────────────────────

  async verifyVNPay(userId: string, params: Record<string, string>) {
    const hashSecret = this.config.get('VNPAY_HASH_SECRET');
    const { vnp_SecureHash, vnp_SecureHashType, ...rest } = params;

    const sorted = Object.keys(rest).sort().reduce((acc, k) => rest[k] ? { ...acc, [k]: rest[k] } : acc, {} as Record<string, string>);
    const signData = new URLSearchParams(sorted).toString();
    const expected = this.hmac512(signData, hashSecret);

    if (vnp_SecureHash !== expected) return { status: 'INVALID_SIGNATURE' };

    const orderId = rest.vnp_TxnRef;
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) return { status: 'NOT_FOUND' };
    if (payment.userId !== userId) return { status: 'FORBIDDEN' };

    if (rest.vnp_ResponseCode === '00') {
      await this.activatePlan(payment);
      return { status: 'SUCCESS', plan: payment.plan };
    }
    await this.prisma.payment.update({ where: { orderId }, data: { status: 'FAILED' } });
    return { status: 'FAILED' };
  }

  // ─── Activate plan ─────────────────────────────────────────────────────────

  private async activatePlan(payment: any) {
    if (payment.plan?.startsWith('VIEW_APPLICANTS:')) {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'SUCCESS' } });
      return;
    }

    const months = payment.plan === 'PREMIUM' ? 12 : 1;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: payment.userId }, data: { plan: payment.plan, planExpiresAt: expiresAt } }),
      this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'SUCCESS' } }),
    ]);
  }

  // ─── View job applicants ───────────────────────────────────────────────────

  async createViewJob(userId: string, jobId: string, gateway: string) {
    const plan = `VIEW_APPLICANTS:${jobId}`;
    const existing = await this.prisma.payment.findFirst({
      where: { userId, plan, status: 'SUCCESS' },
    });
    if (existing) throw new ForbiddenException('Bạn đã mua quyền xem việc làm này');

    const gwUp = gateway.toUpperCase();
    const orderId = this.generateOrderId(`TOPCVVJ`);
    const planCfg = { amount: 10000, label: 'Xem số người ứng tuyển' };

    await this.prisma.payment.create({
      data: { userId, gateway: gwUp, orderId, amount: planCfg.amount, plan },
    });

    if (gwUp === 'MOMO') return this.createMoMo(orderId, planCfg);
    if (gwUp === 'ZALOPAY') return this.createZaloPay(orderId, planCfg);
    if (gwUp === 'VNPAY') return this.createVNPay(orderId, planCfg);
    throw new ForbiddenException('Cổng thanh toán không hợp lệ');
  }

  async checkViewJobPurchased(userId: string, jobId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { userId, plan: `VIEW_APPLICANTS:${jobId}`, status: 'SUCCESS' },
    });
    return !!payment;
  }

  // ─── My plan ───────────────────────────────────────────────────────────────

  async getMyPlan(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { plan: true, planExpiresAt: true } });
    if (!user) return { plan: 'FREE', planExpiresAt: null };

    if (user.plan !== 'FREE' && user.planExpiresAt && user.planExpiresAt < new Date()) {
      await this.prisma.user.update({ where: { id: userId }, data: { plan: 'FREE', planExpiresAt: null } });
      return { plan: 'FREE', planExpiresAt: null };
    }
    return { plan: user.plan ?? 'FREE', planExpiresAt: user.planExpiresAt };
  }

  // ─── My history ────────────────────────────────────────────────────────────

  async getMyHistory(userId: string, opts: { page: number; pageSize: number; startDate?: string; endDate?: string }) {
    const { page, pageSize, startDate, endDate } = opts;
    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [total, payments] = await this.prisma.$transaction([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: { id: true, orderId: true, plan: true, amount: true, gateway: true, status: true, createdAt: true },
      }),
    ]);

    return { data: payments, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getJobApplicantCount(userId: string, jobId: string) {
    const paid = await this.checkViewJobPurchased(userId, jobId);
    if (!paid) throw new ForbiddenException('Bạn chưa mua quyền xem số ứng tuyển của việc làm này');
    const count = await this.prisma.application.count({ where: { jobId } });
    return { count };
  }
}
