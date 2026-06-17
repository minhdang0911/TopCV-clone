import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvScoringService } from './cv-scoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cv-scoring')
@UseGuards(JwtAuthGuard)
export class CvScoringController {
  constructor(private cvScoringService: CvScoringService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  scoreUpload(
    @Req() req: any,
    @UploadedFile() file: { buffer: Buffer; mimetype: string },
  ) {
    return this.cvScoringService.scoreFromFile(file, req.user.sub);
  }

  @Post('match-jd')
  matchJd(@Req() req: any, @Body() body: { resumeId: string; jobId: string }) {
    return this.cvScoringService.matchJd(body.resumeId, body.jobId, req.user.sub);
  }

  @Post('match-jd/upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  matchJdUpload(
    @Req() req: any,
    @UploadedFile() file: { buffer: Buffer; mimetype: string },
    @Query('jobId') jobId: string,
  ) {
    return this.cvScoringService.matchJdFromFile(file, jobId, req.user.sub);
  }

  @Post(':resumeId')
  score(@Req() req: any, @Param('resumeId') resumeId: string) {
    return this.cvScoringService.score(resumeId, req.user.sub);
  }
}
