import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { NotificationsService } from '../notifications/notifications.service';
import { FirebaseService } from '../firebase/firebase.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private notifications: NotificationsService,
    private firebase: FirebaseService,
    private mail: MailService,
  ) {}

  private async getEmployerProfile(userId: string) {
    const profile = await this.prisma.employerProfile.findFirst({ where: { userId } });
    if (!profile) throw new ForbiddenException('Không phải nhà tuyển dụng');
    return profile;
  }

  private async assertQuizOwner(quizId: string, userId: string) {
    const employer = await this.getEmployerProfile(userId);
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Không tìm thấy đề thi');
    if (quiz.employerId !== employer.userId) throw new ForbiddenException();
    return quiz;
  }

  // ─── Quiz CRUD ─────────────────────────────────────────────────────────

  async createQuiz(userId: string, body: {
    title: string;
    description?: string;
    totalPoints: number;
    passRate?: number;
    durationMinutes?: number;
    scoringMode?: 'AUTO' | 'MANUAL';
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    rules?: string;
  }) {
    await this.getEmployerProfile(userId);
    return this.prisma.quiz.create({
      data: {
        employerId: userId,
        title: body.title,
        description: body.description,
        totalPoints: body.totalPoints,
        passRate: body.passRate ?? 70,
        durationMinutes: body.durationMinutes ?? 30,
        scoringMode: body.scoringMode ?? 'AUTO',
        shuffleQuestions: body.shuffleQuestions ?? false,
        shuffleOptions: body.shuffleOptions ?? false,
        rules: body.rules,
      },
    });
  }

  async listQuizzes(userId: string) {
    await this.getEmployerProfile(userId);
    return this.prisma.quiz.findMany({
      where: { employerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { questions: true, assignments: true } },
      },
    });
  }

  async getQuiz(quizId: string, userId: string) {
    await this.assertQuizOwner(quizId, userId);
    return this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: true },
        },
        _count: { select: { assignments: true } },
      },
    });
  }

  async updateQuiz(quizId: string, userId: string, body: any) {
    await this.assertQuizOwner(quizId, userId);
    const { title, description, totalPoints, passRate, durationMinutes, scoringMode, shuffleQuestions, shuffleOptions, rules } = body;
    return this.prisma.quiz.update({
      where: { id: quizId },
      data: { title, description, totalPoints, passRate, durationMinutes, scoringMode, shuffleQuestions, shuffleOptions, rules },
    });
  }

  async deleteQuiz(quizId: string, userId: string) {
    await this.assertQuizOwner(quizId, userId);
    await this.prisma.quiz.delete({ where: { id: quizId } });
    return { success: true };
  }

  // ─── Questions ─────────────────────────────────────────────────────────

  async addQuestion(quizId: string, userId: string, body: {
    questionText?: string;
    isCode?: boolean;
    points?: number;
    options: { optionText?: string; isCorrect: boolean }[];
  }) {
    await this.assertQuizOwner(quizId, userId);
    const count = await this.prisma.quizQuestion.count({ where: { quizId } });
    return this.prisma.quizQuestion.create({
      data: {
        quizId,
        order: count + 1,
        questionText: body.questionText,
        isCode: body.isCode ?? false,
        points: body.points ?? 0,
        options: {
          create: body.options.map(o => ({
            optionText: o.optionText,
            isCorrect: o.isCorrect,
          })),
        },
      },
      include: { options: true },
    });
  }

  async updateQuestion(questionId: string, userId: string, body: {
    questionText?: string;
    isCode?: boolean;
    points?: number;
    options?: { id?: string; optionText?: string; imageUrl?: string; isCorrect: boolean }[];
  }) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { quiz: true },
    });
    if (!question) throw new NotFoundException();
    await this.assertQuizOwner(question.quizId, userId);

    await this.prisma.quizQuestion.update({
      where: { id: questionId },
      data: {
        questionText: body.questionText,
        isCode: body.isCode,
        points: body.points,
      },
    });

    if (body.options) {
      await this.prisma.quizOption.deleteMany({ where: { questionId } });
      await this.prisma.quizOption.createMany({
        data: body.options.map(o => ({
          questionId,
          optionText: o.optionText,
          imageUrl: o.imageUrl,
          isCorrect: o.isCorrect,
        })),
      });
    }

    return this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { options: true },
    });
  }

  async deleteQuestion(questionId: string, userId: string) {
    const question = await this.prisma.quizQuestion.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException();
    await this.assertQuizOwner(question.quizId, userId);
    await this.prisma.quizQuestion.delete({ where: { id: questionId } });
    return { success: true };
  }

  async reorderQuestions(quizId: string, userId: string, orders: { id: string; order: number }[]) {
    await this.assertQuizOwner(quizId, userId);
    await Promise.all(
      orders.map(({ id, order }) =>
        this.prisma.quizQuestion.update({ where: { id }, data: { order } }),
      ),
    );
    return { success: true };
  }

  async uploadQuestionImage(questionId: string, userId: string, file: Express.Multer.File) {
    const question = await this.prisma.quizQuestion.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException();
    await this.assertQuizOwner(question.quizId, userId);
    const url = await this.uploadService.uploadImage(file, 'quiz-questions', `q-${questionId}`);
    await this.prisma.quizQuestion.update({ where: { id: questionId }, data: { imageUrl: url } });
    return { url };
  }

  async uploadOptionImage(optionId: string, userId: string, file: Express.Multer.File) {
    const option = await this.prisma.quizOption.findUnique({
      where: { id: optionId },
      include: { question: true },
    });
    if (!option) throw new NotFoundException();
    await this.assertQuizOwner(option.question.quizId, userId);
    const url = await this.uploadService.uploadImage(file, 'quiz-options', `opt-${optionId}`);
    await this.prisma.quizOption.update({ where: { id: optionId }, data: { imageUrl: url } });
    return { url };
  }

  // ─── Assignments ────────────────────────────────────────────────────────

  async assignQuiz(quizId: string, userId: string, body: {
    applicationIds: string[];
    startsAt?: string;
    endsAt?: string;
  }) {
    const quiz = await this.assertQuizOwner(quizId, userId);

    const created: any[] = [];
    for (const applicationId of body.applicationIds) {
      const app = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          candidate: { include: { candidateProfile: true } },
          job: { select: { title: true } },
        },
      });
      if (!app) continue;

      const existing = await this.prisma.quizAssignment.findUnique({
        where: { quizId_applicationId: { quizId, applicationId } },
      });

      const assignment = existing ?? await this.prisma.quizAssignment.create({
        data: {
          quizId,
          applicationId,
          startsAt: body.startsAt ? new Date(body.startsAt) : null,
          endsAt: body.endsAt ? new Date(body.endsAt) : null,
        },
      });

      created.push({ assignment, candidate: app.candidate });

      const candidateId = app.candidateId;
      const candidateEmail = app.candidate.email;
      const candidateName = app.candidate.candidateProfile?.fullName || candidateEmail;
      const jobTitle = app.job.title;
      const testUrl = `/thi/${assignment.id}`;

      // In-app notification (fire-and-forget)
      this.notifications.create(candidateId, {
        type: 'QUIZ_ASSIGNED',
        title: 'Bạn có bài kiểm tra mới',
        body: `"${quiz.title}" cho vị trí ${jobTitle}`,
        url: testUrl,
        data: { assignmentId: assignment.id, quizId },
      }).catch(() => {});

      // FCM push notification
      if (app.candidate.fcmToken) {
        this.firebase.send(app.candidate.fcmToken, {
          title: 'Bài kiểm tra tuyển dụng',
          body: `${jobTitle} — Nhà tuyển dụng gửi bài kiểm tra "${quiz.title}". Làm ngay!`,
          url: testUrl,
        }).catch(() => {});
      }

      // Email notification
      this.mail.sendQuizAssigned({
        to: candidateEmail,
        candidateName,
        jobTitle,
        quizTitle: quiz.title,
        durationMinutes: quiz.durationMinutes,
        totalPoints: quiz.totalPoints,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        testUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/thi/${assignment.id}`,
      }).catch(() => {});
    }

    return { sent: created.length, assignments: created.map(c => c.assignment) };
  }

  async getAssignments(quizId: string, userId: string) {
    await this.assertQuizOwner(quizId, userId);
    return this.prisma.quizAssignment.findMany({
      where: { quizId },
      include: {
        application: {
          include: {
            candidate: { include: { candidateProfile: true } },
            job: { select: { title: true } },
          },
        },
        attempts: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { sentAt: 'desc' },
    });
  }

  // ─── Candidate: list my assignments ───────────────────────────────────

  async getCandidateAssignments(candidateId: string) {
    return this.prisma.quizAssignment.findMany({
      where: {
        application: { candidateId },
      },
      include: {
        quiz: { select: { title: true, durationMinutes: true, totalPoints: true, passRate: true } },
        attempts: {
          where: { candidateId },
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { sentAt: 'desc' },
    });
  }

  // ─── Attempt: start ────────────────────────────────────────────────────

  async startAttempt(assignmentId: string, candidateId: string) {
    const assignment = await this.prisma.quizAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        quiz: { include: { questions: { include: { options: true }, orderBy: { order: 'asc' } } } },
        application: true,
      },
    });
    if (!assignment) throw new NotFoundException('Không tìm thấy bài thi');
    if (assignment.application.candidateId !== candidateId) throw new ForbiddenException();

    const now = new Date();
    if (assignment.startsAt && now < assignment.startsAt)
      throw new BadRequestException('Chưa đến giờ thi');
    if (assignment.endsAt && now > assignment.endsAt)
      throw new BadRequestException('Đã hết hạn thi');

    const existing = await this.prisma.quizAttempt.findFirst({
      where: { assignmentId, candidateId },
    });
    if (existing) {
      if (existing.submittedAt) throw new ConflictException('Bạn đã nộp bài rồi');
      return this.buildAttemptResponse(existing, assignment.quiz);
    }

    const quiz = assignment.quiz;
    let questionOrder: string[] = quiz.questions.map(q => q.id);
    const optionOrders: Record<string, string[]> = {};

    if (quiz.shuffleQuestions) {
      questionOrder = this.shuffle([...questionOrder]);
    }
    if (quiz.shuffleOptions) {
      for (const q of quiz.questions) {
        optionOrders[q.id] = this.shuffle(q.options.map(o => o.id));
      }
    }

    const attempt = await this.prisma.quizAttempt.create({
      data: { assignmentId, candidateId, questionOrder, optionOrders },
    });

    return this.buildAttemptResponse(attempt, quiz);
  }

  private buildAttemptResponse(attempt: any, quiz: any) {
    const questionOrder: string[] = (attempt.questionOrder as string[]) ?? quiz.questions.map((q: any) => q.id);
    const optionOrders: Record<string, string[]> = (attempt.optionOrders as any) ?? {};

    const orderedQuestions = questionOrder.map(qId => {
      const q = quiz.questions.find((x: any) => x.id === qId);
      if (!q) return null;
      const optOrder: string[] = optionOrders[qId] ?? q.options.map((o: any) => o.id);
      const orderedOptions = optOrder.map(oId => {
        const o = q.options.find((x: any) => x.id === oId);
        return o ? { id: o.id, optionText: o.optionText, imageUrl: o.imageUrl } : null;
      }).filter(Boolean);
      return {
        id: q.id,
        questionText: q.questionText,
        imageUrl: q.imageUrl,
        isCode: q.isCode,
        points: q.points,
        options: orderedOptions,
      };
    }).filter(Boolean);

    return {
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      durationMinutes: quiz.durationMinutes,
      totalPoints: quiz.totalPoints,
      questions: orderedQuestions,
    };
  }

  // ─── Attempt: submit ───────────────────────────────────────────────────

  async submitAttempt(attemptId: string, candidateId: string, answers: { questionId: string; selectedOptionId: string }[]) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assignment: { include: { quiz: { include: { questions: { include: { options: true } } } } } },
      },
    });
    if (!attempt) throw new NotFoundException();
    if (attempt.candidateId !== candidateId) throw new ForbiddenException();
    if (attempt.submittedAt) throw new ConflictException('Đã nộp bài rồi');

    const quiz = attempt.assignment.quiz;

    await this.prisma.attemptAnswer.deleteMany({ where: { attemptId } });
    await this.prisma.attemptAnswer.createMany({
      data: answers.map(a => ({
        attemptId,
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId,
      })),
    });

    let score = 0;
    if (quiz.scoringMode === 'AUTO') {
      const perQuestion = quiz.totalPoints / quiz.questions.length;
      for (const answer of answers) {
        const question = quiz.questions.find((q: any) => q.id === answer.questionId);
        if (!question) continue;
        const option = question.options.find((o: any) => o.id === answer.selectedOptionId);
        if (option?.isCorrect) score += perQuestion;
      }
    } else {
      for (const answer of answers) {
        const question = quiz.questions.find((q: any) => q.id === answer.questionId);
        if (!question) continue;
        const option = question.options.find((o: any) => o.id === answer.selectedOptionId);
        if (option?.isCorrect) score += question.points;
      }
    }
    score = Math.round(score * 100) / 100;

    const passed = (score / quiz.totalPoints) * 100 >= quiz.passRate;

    await this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { submittedAt: new Date(), score, passed },
    });

    return { score, totalPoints: quiz.totalPoints, passed, passRate: quiz.passRate };
  }

  async getAttemptResult(attemptId: string, userId: string) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: { include: { option: true, question: { include: { options: true } } } },
        assignment: { include: { quiz: true } },
      },
    });
    if (!attempt) throw new NotFoundException();
    if (attempt.candidateId !== userId) throw new ForbiddenException();
    return attempt;
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
