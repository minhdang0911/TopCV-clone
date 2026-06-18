import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function estimateReadTime(content: string) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  // ─── Categories ────────────────────────────────────────────────────────────

  async listCategories() {
    return this.prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: { where: { isPublished: true } } } } },
    });
  }

  async createCategory(data: { name: string; description?: string }) {
    const slug = toSlug(data.name);
    return this.prisma.blogCategory.create({ data: { ...data, slug } });
  }

  async updateCategory(id: string, data: { name?: string; description?: string; coverImage?: string }) {
    return this.prisma.blogCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return this.prisma.blogCategory.delete({ where: { id } });
  }

  // ─── Posts ─────────────────────────────────────────────────────────────────

  async listPosts(query: {
    categorySlug?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
  }) {
    const { categorySlug, tag, search, page = 1, limit = 12, featured } = query;
    const skip = (page - 1) * limit;

    const where: any = { isPublished: true };
    if (categorySlug) where.category = { slug: categorySlug };
    if (tag) where.tags = { some: { tag: { slug: tag } } };
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: featured ? { viewCount: 'desc' } : { publishedAt: 'desc' },
        take: limit,
        skip,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      data: posts.map(this._formatPost),
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async getPostBySlug(slug: string, incrementView = false) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });
    if (!post || !post.isPublished) throw new NotFoundException('Bài viết không tồn tại');
    if (incrementView) {
      await this.prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
    }
    return this._formatPost(post);
  }

  async getFeaturedPosts(limit = 5) {
    const posts = await this.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: [{ viewCount: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true } },
        tags: { include: { tag: true } },
      },
    });
    return posts.map(this._formatPost);
  }

  async getRelatedPosts(postId: string, limit = 4) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) return [];
    const posts = await this.prisma.blogPost.findMany({
      where: { isPublished: true, categoryId: post.categoryId, id: { not: postId } },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: { category: { select: { id: true, name: true, slug: true } }, author: { select: { id: true } }, tags: { include: { tag: true } } },
    });
    return posts.map(this._formatPost);
  }

  async createPost(
    authorId: string,
    body: { title: string; categoryId: string; description?: string; content: string; tags?: string[] },
    thumbnailFile?: Express.Multer.File,
  ) {
    let thumbnail: string | undefined;
    if (thumbnailFile) {
      thumbnail = await this.uploadService.uploadImage(thumbnailFile, 'blog', `blog_${Date.now()}`);
    }

    const slug = await this._uniqueSlug(toSlug(body.title));
    const minRead = estimateReadTime(body.content);

    const post = await this.prisma.blogPost.create({
      data: {
        authorId,
        categoryId: body.categoryId,
        title: body.title,
        slug,
        description: body.description,
        content: body.content,
        thumbnail,
        minRead,
        isPublished: false,
      },
    });

    if (body.tags?.length) {
      await this._upsertTags(post.id, body.tags);
    }

    return post;
  }

  async updatePost(
    id: string,
    userId: string,
    body: { title?: string; categoryId?: string; description?: string; content?: string; tags?: string[] },
    thumbnailFile?: Express.Multer.File,
  ) {
    await this._assertOwnerOrAdmin(id, userId);

    const data: any = { ...body };
    delete data.tags;

    if (thumbnailFile) {
      data.thumbnail = await this.uploadService.uploadImage(thumbnailFile, 'blog', `blog_${Date.now()}`);
    }
    if (body.content) data.minRead = estimateReadTime(body.content);

    const post = await this.prisma.blogPost.update({ where: { id }, data });

    if (body.tags !== undefined) {
      await this.prisma.blogPostTag.deleteMany({ where: { postId: id } });
      if (body.tags.length) await this._upsertTags(id, body.tags);
    }

    return post;
  }

  async publishPost(id: string) {
    return this.prisma.blogPost.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
    });
  }

  async unpublishPost(id: string) {
    return this.prisma.blogPost.update({ where: { id }, data: { isPublished: false } });
  }

  async deletePost(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }

  // ─── Admin list (all posts incl. drafts) ──────────────────────────────────

  async adminListPosts(query: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: { category: { select: { id: true, name: true, slug: true } }, author: { select: { id: true } }, tags: { include: { tag: true } } },
      }),
      this.prisma.blogPost.count(),
    ]);
    return { data: posts.map(this._formatPost), meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }

  // ─── Bookmark ──────────────────────────────────────────────────────────────

  async bookmark(userId: string, postId: string) {
    return this.prisma.blogBookmark.upsert({
      where: { userId_postId: { userId, postId } },
      create: { userId, postId },
      update: {},
    });
  }

  async removeBookmark(userId: string, postId: string) {
    return this.prisma.blogBookmark.delete({ where: { userId_postId: { userId, postId } } });
  }

  async myBookmarks(userId: string) {
    const bookmarks = await this.prisma.blogBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: { category: { select: { id: true, name: true, slug: true } }, author: { select: { id: true } }, tags: { include: { tag: true } } },
        },
      },
    });
    return bookmarks.map((b) => this._formatPost(b.post));
  }

  // ─── Tags ──────────────────────────────────────────────────────────────────

  async listTags() {
    return this.prisma.blogTag.findMany({ orderBy: { name: 'asc' } });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private _formatPost(post: any) {
    return {
      ...post,
      tags: post.tags?.map((pt: any) => pt.tag ?? pt) ?? [],
    };
  }

  private async _uniqueSlug(base: string): Promise<string> {
    let slug = base;
    let i = 0;
    while (await this.prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${base}-${++i}`;
    }
    return slug;
  }

  private async _upsertTags(postId: string, tagNames: string[]) {
    for (const name of tagNames) {
      const slug = toSlug(name);
      const tag = await this.prisma.blogTag.upsert({
        where: { slug },
        create: { name, slug },
        update: {},
      });
      await this.prisma.blogPostTag.upsert({
        where: { postId_tagId: { postId, tagId: tag.id } },
        create: { postId, tagId: tag.id },
        update: {},
      });
    }
  }

  async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Chỉ admin mới thực hiện được thao tác này');
  }

  private async _assertOwnerOrAdmin(postId: string, userId: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (post.authorId !== userId && user?.role !== 'ADMIN') throw new ForbiddenException();
  }
}
