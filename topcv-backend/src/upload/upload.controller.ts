import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

@Controller('upload')
export class UploadController {
  constructor(
    private uploadService: UploadService,
    private usersService: UsersService,
  ) {}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    const me = await this.usersService.getMe(userId);

    let folderName: string;
    if (role === 'EMPLOYER') {
      const companyName = me?.employerProfile?.companyName || userId;
      folderName = slugify(companyName);
    } else {
      const fullName = me?.candidateProfile?.fullName || userId;
      folderName = slugify(fullName);
    }

    const folder = `topcv-clone/${folderName}/avatar`;
    const url = await this.uploadService.uploadImage(file, folder, 'avatar');

    if (role === 'EMPLOYER') {
      await this.usersService.updateEmployerProfile(userId, { logoUrl: url });
    } else {
      await this.usersService.updateCandidateProfile(userId, {
        avatarUrl: url,
      });
    }

    return {
      code: 200,
      status: 'success',
      message: 'Upload ảnh đại diện thành công',
      data: { url },
    };
  }

  @Post('cv-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  async uploadCvAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const me = await this.usersService.getMe(userId);
    const fullName = me?.candidateProfile?.fullName || userId;
    const folder = `topcv-clone/${slugify(fullName)}/cv-avatars`;
    const url = await this.uploadService.uploadImage(file, folder, 'cv-avatar');
    return { data: { url } };
  }

  @Post('cover-letter-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  async uploadCoverLetterAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const me = await this.usersService.getMe(userId);
    const fullName = me?.candidateProfile?.fullName || userId;
    const folder = `topcv-clone/${slugify(fullName)}/cover-letter-avatars`;
    const url = await this.uploadService.uploadImage(file, folder, 'cl-avatar');
    return { data: { url } };
  }

  @Post('cv-file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  async uploadCvFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const me = await this.usersService.getMe(userId);
    const fullName = me?.candidateProfile?.fullName || userId;
    const timestamp = Date.now();
    const folder = `topcv-clone/${slugify(fullName)}/cv-files`;
    const ext = file.mimetype === 'application/pdf' ? '.pdf'
      : file.mimetype === 'application/msword' ? '.doc' : '.docx';
    const url = await this.uploadService.uploadFile(file, folder, `cv-${timestamp}${ext}`);
    return { data: { url } };
  }

  @Post('doc')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  async uploadDoc(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user.sub;
    const me = await this.usersService.getMe(userId);
    const companyName = me?.employerProfile?.companyName || userId;
    const folder = `topcv-clone/${slugify(companyName)}/docs`;
    const url = await this.uploadService.uploadDoc(file, folder, `doc-${Date.now()}`);
    return { data: { url } };
  }

  @Post('logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  async uploadLogo(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user.sub;
    const role = req.user.role;

    if (role !== 'EMPLOYER') {
      throw new BadRequestException(
        'Chỉ nhà tuyển dụng mới có thể upload logo công ty',
      );
    }

    const me = await this.usersService.getMe(userId);
    const companyName = me?.employerProfile?.companyName || userId;
    const folderName = slugify(companyName);

    const folder = `topcv-clone/${folderName}/logo`;
    const url = await this.uploadService.uploadImage(file, folder, 'logo');

    await this.usersService.updateEmployerProfile(userId, { logoUrl: url });

    return {
      code: 200,
      status: 'success',
      message: 'Upload logo công ty thành công',
      data: { url },
    };
  }
}
