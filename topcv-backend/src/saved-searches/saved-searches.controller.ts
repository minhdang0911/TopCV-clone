import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchesController {
  constructor(private savedSearchesService: SavedSearchesService) {}

  // GET /saved-searches
  @Get()
  findAll(@Req() req: any) {
    return this.savedSearchesService.findAll(req.user.sub);
  }

  // POST /saved-searches  { name, filters }
  @Post()
  create(
    @Req() req: any,
    @Body() body: { name: string; filters: Record<string, any> },
  ) {
    if (!body.name) throw new BadRequestException('name is required');
    return this.savedSearchesService.create(req.user.sub, body.name, body.filters ?? {});
  }

  // DELETE /saved-searches/:id
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.savedSearchesService.remove(req.user.sub, id);
  }
}
