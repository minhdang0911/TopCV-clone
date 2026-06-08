import { Controller, Get, Query } from '@nestjs/common';
import { EmployersService } from './employers.service';

@Controller('employers')
export class EmployersController {
  constructor(private employersService: EmployersService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.employersService.findAll(query);
  }
}
