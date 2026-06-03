import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JobPositionsService } from './job-positions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('job-positions')
export class JobPositionsController {
  constructor(private jobPositionsService: JobPositionsService) {}

  @Get()
  findAll(@Query() query: { page?: number; limit?: number; search?: string }) {
    return this.jobPositionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobPositionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Req() req: any, @Body() body: { name: string }) {
    return this.jobPositionsService.create(req.user.sub, body, req.ip);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string },
  ) {
    return this.jobPositionsService.update(req.user.sub, id, body, req.ip);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  bulkDelete(@Req() req: any, @Body() body: { ids: number[] }) {
    return this.jobPositionsService.bulkDelete(req.user.sub, body.ids, req.ip);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.jobPositionsService.remove(req.user.sub, id, req.ip);
  }
}
