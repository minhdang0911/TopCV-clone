'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { blogService } from '@/services/blog.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Eye, EyeOff, BookOpen, X, ImagePlus } from 'lucide-react';
import Link from 'next/link';

function PostForm({ categories, post, onSave, onCancel }) {
    const [title, setTitle] = useState(post?.title ?? '');
    const [categoryId, setCategoryId] = useState(post?.category?.id ?? '');
    const [description, setDescription] = useState(post?.description ?? '');
    const [content, setContent] = useState(post?.content ?? '');
    const [tags, setTags] = useState(post?.tags?.map((t) => t.name).join(', ') ?? '');
    const [thumb, setThumb] = useState(null);
    const [thumbPreview, setThumbPreview] = useState(post?.thumbnail ?? null);
    const [publishNow, setPublishNow] = useState(post?.isPublished ?? false);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef();
    const manualDescRef = useRef(!!post?.description);

    // Auto-fill description from content when not manually edited
    useEffect(() => {
        if (!manualDescRef.current && content) {
            const plain = content
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            setDescription(plain.slice(0, 220));
        }
    }, [content]);

    const handleThumb = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setThumb(f);
        setThumbPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async () => {
        if (!title || !categoryId || !content) return;
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('categoryId', categoryId);
            fd.append('description', description);
            fd.append('content', content);
            fd.append(
                'tags',
                JSON.stringify(
                    tags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                ),
            );
            if (thumb) fd.append('thumbnail', thumb);

            let savedId = post?.id;
            if (post) {
                await blogService.updatePost(post.id, fd);
            } else {
                const res = await blogService.createPost(fd);
                savedId = res.data?.data?.id ?? res.data?.id;
            }

            if (publishNow && savedId && !post?.isPublished) {
                await blogService.publishPost(savedId);
            } else if (!publishNow && post?.isPublished) {
                await blogService.unpublishPost(savedId);
            }

            onSave();
        } catch {
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto py-6 px-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl mx-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h2 className="text-[16px] font-bold text-slate-800">
                        {post ? 'Sửa bài viết' : 'Tạo bài viết mới'}
                    </h2>
                    <button onClick={onCancel}>
                        <X size={18} className="text-slate-400 hover:text-slate-600" />
                    </button>
                </div>

                {/* Fields above editor */}
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label className="text-[12px] text-slate-500 mb-1 block">Tiêu đề *</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Tiêu đề bài viết..."
                                className="text-[13px]"
                            />
                        </div>
                        <div>
                            <Label className="text-[12px] text-slate-500 mb-1 block">Chủ đề *</Label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-green-400"
                            >
                                <option value="">-- Chọn chủ đề --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="text-[12px] text-slate-500 mb-1 block">
                                Tags (cách nhau bằng dấu phẩy)
                            </Label>
                            <Input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="React, NestJS, Fresher..."
                                className="text-[13px]"
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-[12px] text-slate-500 mb-1 block">Mô tả ngắn</Label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Mô tả hiển thị ngoài danh sách..."
                                className="text-[13px]"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-[12px] text-slate-500 mb-1 block">Ảnh thumbnail</Label>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleThumb} />
                        {thumbPreview ? (
                            <div className="relative inline-block">
                                <img
                                    src={thumbPreview}
                                    alt=""
                                    className="h-28 rounded-xl object-cover border border-slate-200"
                                />
                                <button
                                    onClick={() => {
                                        setThumb(null);
                                        setThumbPreview(null);
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded p-0.5"
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-slate-200 rounded-xl text-[12px] text-slate-400 hover:border-green-400 hover:text-green-600 transition-colors"
                            >
                                <ImagePlus size={16} /> Chọn ảnh thumbnail
                            </button>
                        )}
                    </div>
                </div>

                {/* TinyMCE — outside any overflow container so dropdowns aren't clipped */}
                <div className="px-5 pb-4">
                    <Label className="text-[12px] text-slate-500 mb-1 block">Nội dung *</Label>
                    <Editor
                        tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.4/tinymce.min.js"
                        value={content}
                        onEditorChange={(val) => setContent(val)}
                        init={{
                            height: 500,
                            menubar: true,
                            branding: false,
                            resize: false,
                            plugins: [
                                'advlist',
                                'autolink',
                                'lists',
                                'link',
                                'image',
                                'charmap',
                                'searchreplace',
                                'visualblocks',
                                'codesample',
                                'fullscreen',
                                'insertdatetime',
                                'media',
                                'table',
                                'preview',
                                'anchor',
                                'emoticons',
                                'wordcount',
                                'code',
                            ],
                            toolbar:
                                'undo redo | blocks fontfamily fontsize | ' +
                                'bold italic underline strikethrough | forecolor backcolor | ' +
                                'alignleft aligncenter alignright alignjustify | ' +
                                'bullist numlist outdent indent | ' +
                                'link image media table codesample emoticons charmap | ' +
                                'removeformat code fullscreen preview',
                            block_formats:
                                'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Preformatted=pre',
                            font_family_formats:
                                'Be Vietnam Pro=Be Vietnam Pro,sans-serif; Arial=arial,helvetica,sans-serif; ' +
                                'Georgia=georgia,palatino; Courier New=courier new,courier; Verdana=verdana,geneva',
                            font_size_formats: '12px 13px 14px 15px 16px 18px 20px 22px 24px 28px 32px 36px',
                            image_advtab: true,
                            image_uploadtab: false,
                            content_css:
                                'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap',
                            content_style:
                                "body { font-family: 'Be Vietnam Pro', sans-serif; font-size: 14px; line-height: 1.75; color: #1e293b; max-width: 100%; } " +
                                'h1 { font-size: 28px; font-weight: 700; margin-top: 28px; } ' +
                                'h2 { font-size: 22px; font-weight: 700; margin-top: 24px; } ' +
                                'h3 { font-size: 18px; font-weight: 600; margin-top: 18px; } ' +
                                'p { margin: 0 0 12px; } ' +
                                'img { max-width: 100%; height: auto; border-radius: 8px; } ' +
                                'pre { background: #f8fafc; border-radius: 6px; padding: 12px; font-size: 13px; } ' +
                                'table { border-collapse: collapse; width: 100%; } ' +
                                'table td, table th { border: 1px solid #e2e8f0; padding: 8px 12px; }',
                            table_default_styles: { 'border-collapse': 'collapse', width: '100%' },
                            codesample_languages: [
                                { text: 'JavaScript', value: 'javascript' },
                                { text: 'TypeScript', value: 'typescript' },
                                { text: 'HTML/XML', value: 'markup' },
                                { text: 'CSS', value: 'css' },
                                { text: 'Python', value: 'python' },
                                { text: 'SQL', value: 'sql' },
                                { text: 'Bash', value: 'bash' },
                            ],
                        }}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-5 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={publishNow}
                            onChange={(e) => setPublishNow(e.target.checked)}
                            className="w-4 h-4 accent-green-600"
                        />
                        <span className="text-[13px] text-slate-600 font-medium">Đăng bài ngay</span>
                    </label>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onCancel} className="text-[13px]">
                            Huỷ
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-[13px]"
                        >
                            {saving ? 'Đang lưu...' : publishNow ? 'Lưu & đăng' : 'Lưu nháp'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CategoryManager({ categories, onRefresh }) {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!name) return;
        setSaving(true);
        try {
            await blogService.createCategory({ name, description: desc });
            setName('');
            setDesc('');
            onRefresh();
        } catch {
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xoá chủ đề này?')) return;
        await blogService.deleteCategory(id).catch(() => {});
        onRefresh();
    };

    return (
        <div className="space-y-4">
            <form onSubmit={e => { e.preventDefault(); handleCreate(); }} className="flex gap-2 items-end">
                <div className="flex-1">
                    <Label className="text-[12px] text-slate-500 mb-1 block">Tên chủ đề</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Bí kíp tìm việc..."
                        className="text-[13px]"
                    />
                </div>
                <div className="flex-1">
                    <Label className="text-[12px] text-slate-500 mb-1 block">Mô tả (tuỳ chọn)</Label>
                    <Input
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Mô tả chủ đề..."
                        className="text-[13px]"
                    />
                </div>
                <Button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-[13px] shrink-0"
                >
                    <Plus size={14} className="mr-1" /> Thêm
                </Button>
            </form>
            <div className="space-y-2">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50"
                    >
                        <div>
                            <p className="text-[13px] font-medium text-slate-700">{cat.name}</p>
                            <p className="text-[11px] text-slate-400">
                                {cat.slug} • {cat._count?.posts ?? 0} bài viết
                            </p>
                        </div>
                        <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminBlogPage() {
    const [tab, setTab] = useState('posts'); // 'posts' | 'categories'
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [tick, setTick] = useState(0);

    const refresh = useCallback(() => setTick((t) => t + 1), []);

    useEffect(() => {
        let active = true;
        Promise.all([blogService.adminListPosts({ page, limit: 15 }), blogService.listCategories()])
            .then(([postRes, catRes]) => {
                if (!active) return;
                setPosts(postRes.data.data);
                setMeta(postRes.data.meta);
                setCategories(catRes.data);
                setLoading(false);
            })
            .catch(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [page, tick]);

    const handlePublish = async (id, isPublished) => {
        try {
            if (isPublished) await blogService.unpublishPost(id);
            else await blogService.publishPost(id);
            refresh();
        } catch {}
    };

    const handleDelete = async (id) => {
        if (!confirm('Xoá bài viết này?')) return;
        await blogService.deletePost(id).catch(() => {});
        refresh();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[20px] font-bold text-slate-800">Quản lý Blog</h1>
                        <p className="text-[13px] text-slate-400 mt-0.5">
                            Tạo và quản lý bài viết cẩm nang nghề nghiệp
                        </p>
                    </div>
                    {tab === 'posts' && (
                        <Button
                            onClick={() => {
                                setEditing(null);
                                setShowForm(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-[13px] gap-1.5"
                        >
                            <Plus size={14} /> Tạo bài viết
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    {[
                        ['posts', 'Bài viết'],
                        ['categories', 'Chủ đề'],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${tab === key ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'categories' && (
                    <Card>
                        <CardContent className="p-5">
                            <CategoryManager categories={categories} onRefresh={load} />
                        </CardContent>
                    </Card>
                )}

                {tab === 'posts' && (
                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="text-center py-12 text-slate-400 text-[13px]">Đang tải...</div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-16 space-y-3">
                                    <BookOpen size={36} className="mx-auto text-slate-200" />
                                    <p className="text-[14px] text-slate-400">Chưa có bài viết nào</p>
                                    <Button
                                        onClick={() => setShowForm(true)}
                                        variant="outline"
                                        size="sm"
                                        className="text-[13px] gap-1"
                                    >
                                        <Plus size={13} /> Tạo bài viết đầu tiên
                                    </Button>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">
                                                Tiêu đề
                                            </th>
                                            <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">
                                                Chủ đề
                                            </th>
                                            <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase">
                                                Trạng thái
                                            </th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {posts.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {p.thumbnail ? (
                                                            <img
                                                                src={p.thumbnail}
                                                                alt=""
                                                                className="w-12 h-8 rounded object-cover shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-8 rounded bg-green-50 shrink-0" />
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-medium text-slate-700 truncate max-w-xs">
                                                                {p.title}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400">
                                                                {p.createdAt
                                                                    ? new Date(p.createdAt).toLocaleDateString('vi-VN')
                                                                    : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-[12px] text-slate-500">
                                                    {p.category?.name ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        className={`text-[11px] ${p.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-100'}`}
                                                    >
                                                        {p.isPublished ? 'Đã đăng' : 'Nháp'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1 justify-end">
                                                        {p.isPublished && (
                                                            <Link href={`/blog/${p.slug}`} target="_blank">
                                                                <button
                                                                    className="p-1.5 rounded text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                                                    title="Xem bài viết"
                                                                >
                                                                    <Eye size={14} />
                                                                </button>
                                                            </Link>
                                                        )}
                                                        <button
                                                            onClick={() => handlePublish(p.id, p.isPublished)}
                                                            className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title={p.isPublished ? 'Ẩn bài' : 'Đăng bài'}
                                                        >
                                                            {p.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditing(p);
                                                                setShowForm(true);
                                                            }}
                                                            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p.id)}
                                                            className="p-1.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {meta && meta.lastPage > 1 && (
                                <div className="flex justify-center gap-2 p-4 border-t border-slate-100">
                                    {Array.from({ length: meta.lastPage }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-8 h-8 rounded text-[13px] font-medium ${p === page ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-green-50'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {showForm && (
                <PostForm
                    categories={categories}
                    post={editing}
                    onSave={() => {
                        setShowForm(false);
                        setEditing(null);
                        refresh();
                    }}
                    onCancel={() => {
                        setShowForm(false);
                        setEditing(null);
                    }}
                />
            )}
        </div>
    );
}
