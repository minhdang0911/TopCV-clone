import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { join } from 'path';

const STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
  REVIEWING: { title: '📋 Đơn ứng tuyển đang được xem xét', body: 'Nhà tuyển dụng đang xem hồ sơ của bạn.' },
  INTERVIEW: { title: '🎉 Bạn được mời phỏng vấn!',         body: 'Nhà tuyển dụng muốn gặp bạn. Kiểm tra chi tiết ngay.' },
  OFFERED:   { title: '✅ Chúc mừng! Bạn nhận được Offer!', body: 'Nhà tuyển dụng đã gửi thư mời làm việc cho bạn.' },
  REJECTED:  { title: 'Cập nhật đơn ứng tuyển',             body: 'Rất tiếc, vị trí này không phù hợp với bạn lúc này.' },
};

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App;

  onModuleInit() {
    if (getApps().length === 0) {
      this.app = initializeApp({
        credential: cert(join(process.cwd(), 'firebase-service-account.json')),
      });
      this.logger.log('Firebase Admin initialized');
    } else {
      this.app = getApps()[0];
    }
  }

  async sendApplicationStatusNotification(fcmToken: string, jobTitle: string, newStatus: string) {
    if (!fcmToken) return;
    const msg = STATUS_MESSAGES[newStatus];
    if (!msg) return;
    await this.send(fcmToken, {
      title: msg.title,
      body: `${jobTitle} — ${msg.body}`,
      url: '/viec-da-ung-tuyen',
    });
  }

  async send(fcmToken: string, payload: { title: string; body: string; url?: string }) {
    if (!fcmToken) return;
    try {
      const message: Message = {
        token: fcmToken,
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: '/logo-192.png',
          },
          fcmOptions: { link: payload.url || '/' },
        },
        data: {
          title: payload.title,
          body: payload.body,
          url: payload.url || '/',
        },
      };
      await getMessaging(this.app).send(message);
    } catch (err: any) {
      const code = err?.errorInfo?.code || err?.code || err?.message;
      this.logger.warn(`FCM send failed: ${code}`);
    }
  }
}
