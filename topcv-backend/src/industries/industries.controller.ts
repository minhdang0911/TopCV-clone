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
import { IndustriesService } from './industries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('industries')
export class IndustriesController {
  constructor(private industriesService: IndustriesService) {}

  @Get()
  findAll(@Query() query: { page?: number; limit?: number; search?: string }) {
    return this.industriesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.industriesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Req() req: any, @Body() body: { name: string }) {
    return this.industriesService.create(req.user.sub, body, req.ip);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string },
  ) {
    return this.industriesService.update(req.user.sub, id, body, req.ip);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  bulkDelete(@Req() req: any, @Body() body: { ids: number[] }) {
    return this.industriesService.bulkDelete(req.user.sub, body.ids, req.ip);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.industriesService.remove(req.user.sub, id, req.ip);
  }
}
