import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private resumesService: ResumesService) {}

  @Get()
  findAll(@Req() req: any, @Query('type') type?: string) {
    return this.resumesService.findAll(req.user.sub, type ?? 'resume');
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.resumesService.create(req.user.sub, body);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.resumesService.findOne(req.user.sub, id);
  }

  @Get(':id/view')
  findOneForViewer(@Req() req: any, @Param('id') id: string) {
    return this.resumesService.findOneForViewer(req.user.sub, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.resumesService.update(req.user.sub, id, body);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.resumesService.remove(req.user.sub, id);
  }
}
