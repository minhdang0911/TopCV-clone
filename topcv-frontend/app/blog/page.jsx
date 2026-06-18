'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { blogService } from '@/services/blog.service';
import { BookOpen, Clock, Bookmark, MoreHorizontal, ChevronRight, Link2 } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import bannerBlog from '@/app/assests/img/banner blog.webp';

const decodeHtml = (str) => {
    if (!str || typeof document === 'undefined') return str ?? '';
    const el = document.createElement('div');
    el.innerHTML = str;
    return el.textContent || str;
};

function ShareMenu({ post, onClose }) {
    const url = typeof window !== 'undefined'
        ? `${window.location.origin}/blog/${post.slug}`
        : `/blog/${post.slug}`;

    const copyLink = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await navigator.clipboard.writeText(url);
        onClose();
    };

    return (
        <div className="absolute right-0 top-8 z-50 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 text-[13px]"
            onClick={e => e.stopPropagation()}>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                target="_blank" rel="noreferrer" onClick={onClose}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-slate-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Chia sẻ lên Facebook
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`}
                target="_blank" rel="noreferrer" onClick={onClose}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-slate-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.849L2.33 2.25H9.08l4.262 5.636L18.244 2.25zM17.083 19.77h1.833L6.957 4.126H4.997L17.083 19.77z" />
                </svg>
                Chia sẻ lên Twitter
            </a>
            <button onClick={copyLink}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-slate-700 w-full text-left">
                <Link2 size={14} className="text-slate-500" />
                Sao chép liên kết
            </button>
        </div>
    );
}

// Card dùng ở featured (large)
function PostCard({ post, size = 'sm', bookmarkedIds, onBookmark }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const isBookmarked = bookmarkedIds.has(post.id);

    useEffect(() => {
        if (!menuOpen) return;
        const close = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [menuOpen]);

    if (size === 'lg') return (
        <div className="group">
            <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative overflow-hidden rounded-xl mb-3 bg-slate-100">
                    {post.thumbnail
                        ? <img src={post.thumbnail} alt={post.title} className="w-full h-auto group-hover:scale-105 transition-transform duration-300" />
                        : <div className="aspect-video bg-linear-to-br from-green-100 to-emerald-50 flex items-center justify-center"><BookOpen size={48} className="text-green-300" /></div>
                    }
                </div>
                {post.category && (
                    <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wide mb-1">{post.category.name}</p>
                )}
                <h2 className="text-[17px] font-bold text-slate-800 leading-snug mb-2 group-hover:text-green-700 transition-colors line-clamp-2">{post.title}</h2>
                {post.description && <p className="text-[13px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">{decodeHtml(post.description)}</p>}
            </Link>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] text-slate-400">
                    <span>TopCV</span>
                    <span>·</span>
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                    {post.minRead && <><span>·</span><span className="flex items-center gap-1"><Clock size={11} />{post.minRead} phút đọc</span></>}
                </div>
                <div className="flex items-center gap-0.5" ref={menuRef}>
                    <button onClick={() => onBookmark(post)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors ${isBookmarked ? 'text-green-600' : 'text-slate-400'}`}>
                        <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    <div className="relative">
                        <button onClick={e => { e.preventDefault(); setMenuOpen(p => !p); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <MoreHorizontal size={14} />
                        </button>
                        {menuOpen && <ShareMenu post={post} onClose={() => setMenuOpen(false)} />}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <Link href={`/blog/${post.slug}`} className="group flex gap-3 items-start">
            <div className="w-18 h-13.5 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                {post.thumbnail
                    ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full bg-linear-to-br from-green-100 to-emerald-50" />
                }
            </div>
            <div className="min-w-0">
                {post.category && <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-0.5">{post.category.name}</p>}
                <h3 className="text-[13px] font-semibold text-slate-700 line-clamp-2 group-hover:text-green-700 transition-colors leading-snug">{post.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</p>
            </div>
        </Link>
    );
}

// Card dùng trong lưới theo danh mục
function PostCardGrid({ post, bookmarkedIds, onBookmark }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const isBookmarked = bookmarkedIds.has(post.id);

    useEffect(() => {
        if (!menuOpen) return;
        const close = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [menuOpen]);

    return (
        <div className="group">
            <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative overflow-hidden rounded-xl aspect-[4/3] mb-3 bg-slate-100">
                    {post.thumbnail
                        ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full bg-linear-to-br from-green-100 to-emerald-50 flex items-center justify-center"><BookOpen size={32} className="text-green-300" /></div>
                    }
                </div>
                {post.category && <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-1">{post.category.name}</p>}
                <h3 className="text-[14px] font-semibold text-slate-800 line-clamp-2 group-hover:text-green-700 transition-colors leading-snug mb-1">{post.title}</h3>
            </Link>
            <div className="flex items-center justify-between mt-0.5">
                <p className="text-[12px] text-slate-400">
                    TopCV · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                </p>
                <div className="flex items-center gap-0.5" ref={menuRef}>
                    <button onClick={() => onBookmark(post)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors ${isBookmarked ? 'text-green-600' : 'text-slate-400'}`}>
                        <Bookmark size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    <div className="relative">
                        <button onClick={e => { e.preventDefault(); setMenuOpen(p => !p); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <MoreHorizontal size={13} />
                        </button>
                        {menuOpen && <ShareMenu post={post} onClose={() => setMenuOpen(false)} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BlogPage() {
    const { isAuthenticated } = useAuthStore();
    const [categories, setCategories] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [byCategory, setByCategory] = useState({});
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            blogService.listCategories(),
            blogService.getFeatured(5),
        ]).then(([catRes, featRes]) => {
            const cats = catRes.data;
            setCategories(cats);
            setFeatured(featRes.data);
            Promise.all(
                cats.map(cat =>
                    blogService.listPosts({ category: cat.slug, limit: 4 })
                        .then(res => [cat.slug, res.data.data])
                )
            ).then(entries => {
                setByCategory(Object.fromEntries(entries));
                setLoading(false);
            });
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        blogService.myBookmarks().then(res => {
            const ids = new Set((res.data || []).map(p => p.post?.id ?? p.postId ?? p.id));
            setBookmarkedIds(ids);
        }).catch(() => {});
    }, [isAuthenticated]);

    const handleBookmark = (post) => {
        if (!isAuthenticated) { window.location.href = '/login'; return; }
        const already = bookmarkedIds.has(post.id);
        setBookmarkedIds(prev => {
            const next = new Set(prev);
            already ? next.delete(post.id) : next.add(post.id);
            return next;
        });
        (already ? blogService.removeBookmark(post.id) : blogService.bookmark(post.id))
            .catch(() => {
                setBookmarkedIds(prev => {
                    const next = new Set(prev);
                    already ? next.add(post.id) : next.delete(post.id);
                    return next;
                });
            });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="relative bg-linear-to-br from-green-50 to-emerald-50 overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 py-10 flex items-center gap-8">
                    <div className="flex-1">
                        <h1 className="text-[28px] font-bold text-slate-800 mb-2">Cẩm nang nghề nghiệp</h1>
                        <p className="text-[14px] text-slate-500 leading-relaxed max-w-md">
                            Khám phá thông tin hữu ích liên quan tới nghề nghiệp bạn quan tâm. Chia sẻ kỹ năng,
                            kiến thức chuyên môn giúp bạn tìm được công việc phù hợp và phát triển bản thân.
                        </p>
                    </div>
                    <div className="shrink-0 hidden md:block">
                        <Image src={bannerBlog} alt="Cẩm nang nghề nghiệp" className="h-40 w-auto" />
                    </div>
                </div>
                <div className="border-t border-green-100">
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
                            <Link href="/blog" className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium bg-green-600 text-white">
                                Tất cả
                            </Link>
                            {categories.map(cat => (
                                <Link key={cat.id} href={`/blog/${cat.slug}`}
                                    className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors">
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
                {/* Featured */}
                {featured.length > 0 && (
                    <section>
                        <h2 className="text-[18px] font-bold text-slate-800 mb-5">Bài viết nổi bật</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="md:col-span-3">
                                <PostCard post={featured[0]} size="lg" bookmarkedIds={bookmarkedIds} onBookmark={handleBookmark} />
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-4 divide-y divide-slate-100">
                                {featured.slice(1, 4).map(p => (
                                    <div key={p.id} className="pt-4 first:pt-0">
                                        <PostCard post={p} size="sm" bookmarkedIds={bookmarkedIds} onBookmark={handleBookmark} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {loading && <div className="text-center py-12 text-slate-400 text-[13px]">Đang tải...</div>}

                {/* Per-category */}
                {categories.map(cat => {
                    const posts = byCategory[cat.slug];
                    if (!posts?.length) return null;
                    return (
                        <section key={cat.id}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[18px] font-bold text-slate-800">{cat.name}</h2>
                                <Link href={`/blog/${cat.slug}`}
                                    className="flex items-center gap-1 text-[13px] text-green-600 hover:text-green-700 font-medium">
                                    Xem tất cả <ChevronRight size={14} />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                {posts.map(p => (
                                    <PostCardGrid key={p.id} post={p} bookmarkedIds={bookmarkedIds} onBookmark={handleBookmark} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
