import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return this.usersService.findById(req.user.sub)
  }

  @Patch('employer/profile')
  @UseGuards(JwtAuthGuard)
  updateEmployerProfile(@Req() req: any, @Body() body: any) {
    return this.usersService.updateEmployerProfile(req.user.sub, body)
  }

  @Get('employer/profile')
  @UseGuards(JwtAuthGuard)
  getEmployerProfile(@Req() req: any) {
    return this.usersService.getEmployerProfile(req.user.sub)
  }

  @Get('candidate/profile')
  @UseGuards(JwtAuthGuard)
  getCandidateProfile(@Req() req: any) {
    return this.usersService.getCandidateProfile(req.user.sub)
  }
}