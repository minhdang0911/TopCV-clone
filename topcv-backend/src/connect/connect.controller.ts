import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConnectService } from './connect.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@Controller('connect')
export class ConnectController {
  constructor(private connectService: ConnectService) {}

  // ─── EMPLOYER ───────────────────────────────────────────────────────────────

  @Get('suggestions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  getSuggestions(@Req() req: any, @Query() query: any) {
    return this.connectService.getSuggestions(req.user.sub, query);
  }

  @Post('skip/:candidateUserId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  skip(@Req() req: any, @Param('candidateUserId') candidateUserId: string) {
    return this.connectService.skip(req.user.sub, candidateUserId);
  }

  @Post('request/:candidateUserId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  request(@Req() req: any, @Param('candidateUserId') candidateUserId: string) {
    return this.connectService.request(req.user.sub, candidateUserId);
  }

  @Get('sent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  mySentRequests(@Req() req: any, @Query() query: any) {
    return this.connectService.mySentRequests(req.user.sub, query);
  }

  // ─── CANDIDATE ──────────────────────────────────────────────────────────────

  @Get('my-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  myRequests(@Req() req: any, @Query() query: any) {
    return this.connectService.myRequests(req.user.sub, query);
  }

  @Post('accept/:connectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  accept(@Req() req: any, @Param('connectId') connectId: string) {
    return this.connectService.accept(req.user.sub, connectId);
  }

  @Post('reject/:connectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  reject(@Req() req: any, @Param('connectId') connectId: string) {
    return this.connectService.reject(req.user.sub, connectId);
  }
}
