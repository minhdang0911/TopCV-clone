import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CoverLettersService } from './cover-letters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cover-letters')
export class CoverLettersController {
  constructor(private coverLettersService: CoverLettersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: any) {
    return this.coverLettersService.findAll(req.user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() body: any) {
    return this.coverLettersService.create(req.user.sub, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coverLettersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.coverLettersService.update(req.user.sub, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.coverLettersService.remove(req.user.sub, id);
  }
}
