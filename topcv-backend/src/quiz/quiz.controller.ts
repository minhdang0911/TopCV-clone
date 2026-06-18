import {
  Controller, Get, Post, Patch, Delete, Param, Body, Req,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuizService } from './quiz.service';

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private quizService: QuizService) {}

  // ─── Quiz CRUD ─────────────────────────────────────────────────────────

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.quizService.createQuiz(req.user.sub, body);
  }

  @Get()
  list(@Req() req: any) {
    return this.quizService.listQuizzes(req.user.sub);
  }

  // ─── Static routes BEFORE :id ──────────────────────────────────────────

  @Get('candidate/assignments')
  getCandidateAssignments(@Req() req: any) {
    return this.quizService.getCandidateAssignments(req.user.sub);
  }

  @Post('attempt/start/:assignmentId')
  startAttempt(@Req() req: any, @Param('assignmentId') assignmentId: string) {
    return this.quizService.startAttempt(assignmentId, req.user.sub);
  }

  @Post('attempt/:attemptId/submit')
  submitAttempt(
    @Req() req: any,
    @Param('attemptId') attemptId: string,
    @Body() body: { answers: { questionId: string; selectedOptionId: string }[] },
  ) {
    return this.quizService.submitAttempt(attemptId, req.user.sub, body.answers);
  }

  @Get('attempt/:attemptId/result')
  getResult(@Req() req: any, @Param('attemptId') attemptId: string) {
    return this.quizService.getAttemptResult(attemptId, req.user.sub);
  }

  // ─── Question image upload ─────────────────────────────────────────────

  @Post('questions/:questionId/upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadQuestionImage(
    @Req() req: any,
    @Param('questionId') questionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.quizService.uploadQuestionImage(questionId, req.user.sub, file);
  }

  @Post('options/:optionId/upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadOptionImage(
    @Req() req: any,
    @Param('optionId') optionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.quizService.uploadOptionImage(optionId, req.user.sub, file);
  }

  // ─── Parameterized Quiz routes ─────────────────────────────────────────

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.quizService.getQuiz(id, req.user.sub);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.quizService.updateQuiz(id, req.user.sub, body);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.quizService.deleteQuiz(id, req.user.sub);
  }

  @Post(':id/questions')
  addQuestion(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.quizService.addQuestion(id, req.user.sub, body);
  }

  @Patch(':id/questions/reorder')
  reorder(@Req() req: any, @Param('id') id: string, @Body() body: { orders: { id: string; order: number }[] }) {
    return this.quizService.reorderQuestions(id, req.user.sub, body.orders);
  }

  @Patch('questions/:questionId')
  updateQuestion(@Req() req: any, @Param('questionId') questionId: string, @Body() body: any) {
    return this.quizService.updateQuestion(questionId, req.user.sub, body);
  }

  @Delete('questions/:questionId')
  deleteQuestion(@Req() req: any, @Param('questionId') questionId: string) {
    return this.quizService.deleteQuestion(questionId, req.user.sub);
  }

  @Post(':id/assign')
  assign(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.quizService.assignQuiz(id, req.user.sub, body);
  }

  @Get(':id/assignments')
  getAssignments(@Req() req: any, @Param('id') id: string) {
    return this.quizService.getAssignments(id, req.user.sub);
  }
}
