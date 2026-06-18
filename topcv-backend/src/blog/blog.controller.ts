import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Req,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  // ─── Public routes ─────────────────────────────────────────────────────────

  @Get('categories')
  listCategories() {
    return this.blogService.listCategories();
  }

  @Get('tags')
  listTags() {
    return this.blogService.listTags();
  }

  @Get('featured')
  getFeatured(@Query('limit') limit?: string) {
    return this.blogService.getFeaturedPosts(limit ? +limit : 5);
  }

  @Get()
  listPosts(
    @Query('category') categorySlug?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blogService.listPosts({ categorySlug, tag, search, page: page ? +page : 1, limit: limit ? +limit : 12 });
  }

  @Get('post/:slug')
  getPost(@Param('slug') slug: string) {
    return this.blogService.getPostBySlug(slug, true);
  }

  @Get('post/:id/related')
  getRelated(@Param('id') id: string) {
    return this.blogService.getRelatedPosts(id);
  }

  // ─── Auth required ─────────────────────────────────────────────────────────

  @Post('post/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  bookmark(@Req() req: any, @Param('id') id: string) {
    return this.blogService.bookmark(req.user.sub, id);
  }

  @Delete('post/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  removeBookmark(@Req() req: any, @Param('id') id: string) {
    return this.blogService.removeBookmark(req.user.sub, id);
  }

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  myBookmarks(@Req() req: any) {
    return this.blogService.myBookmarks(req.user.sub);
  }

  // ─── Admin only ────────────────────────────────────────────────────────────

  @Get('admin/posts')
  @UseGuards(JwtAuthGuard)
  async adminList(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    await this.blogService.assertAdmin(req.user.sub);
    return this.blogService.adminListPosts({ page: page ? +page : 1, limit: limit ? +limit : 20 });
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  async createCategory(@Req() req: any, @Body() body: { name: string; description?: string }) {
    await this.blogService.assertAdmin(req.user.sub);
    return this.blogService.createCategory(body);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  async updateCategory(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    await this.blogService.assertAdmin(req.user.sub);
    return this.blogService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCategory(@Req() req: any, @Param('id') id: string) {
    await this.blogService.assertAdmin(req.user.sub);
    return this.blogService.deleteCategory(id);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('thumbnail', { storage: memoryStorage() }))
  async createPost(
    @Req() req: any,
    @Body() body: any,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    await this.blogService.assertAdmin(req.user.sub);
    const tags = body.tags ? (Array.isArray(body.tags) ? body.tags : JSON.parse(body.tags)) : [];
    return this.blogService.createPost(req.user.sub, { ...body, tags }, thumbnail);
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('thumbnail', { storage: memoryStorage() }))
  async updatePost(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    await this.blogService.assertAdmin(req.user.sub);
    const tags = body.tags !== undefined ? (Array.isArray(body.tags) ? body.tags : JSON.parse(body.tags)) : undefined;
    return this.blogService.updatePost(id, req.user.sub, { ...body, tags }, thumbnail);
  }

  @Patch('posts/:id/publish')
  @UseGuards(JwtAuthGuard)
  async publish(@Req() req: any, @Param('id') id: string) {
    await this.blogService.assertAdmin(req.user.sub);
    return this.blogService.publishPost(id);
  }

  @Patch('posts/:id/unpublish')
  @UseGuards(JwtAuthGuard)
  async unpublish(@Req() req: any, @Param('id') id: string) {
    await this.blogService.assertAdmin(req.user.sub);
    return this.blogService.unpublishPost(id);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Req() req: any, @Param('id') id: string) {
    await this.blogService.assertAdmin(req.user.sub);
    return this.blogService.deletePost(id);
  }
}
