'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { blogService } from '@/services/blog.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, Clock, List, X, Share2 } from 'lucide-react';

/* ── Category page ─────────────────────────────────────────── */
function PostCardGrid({ post }) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-xl aspect-[4/3] mb-3 bg-slate-100">
                {post.thumbnail
                    ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center"><BookOpen size={32} className="text-green-300" /></div>
                }
            </div>
            {post.category && <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-1">{post.category.name}</p>}
            <h3 className="text-[14px] font-semibold text-slate-800 line-clamp-2 group-hover:text-green-700 transition-colors leading-snug mb-1">{post.title}</h3>
            <p className="text-[12px] text-slate-400">TopCV • {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</p>
        </Link>
    );
}

function CategoryPage({ category, categories }) {
    const [posts, setPosts] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [featRes, postsRes] = await Promise.all([
                    blogService.listPosts({ category: category.slug, limit: 4, featured: true }),
                    blogService.listPosts({ category: category.slug, page, limit: 12 }),
                ]);
                setFeatured(featRes.data.data);
                setPosts(postsRes.data.data);
                setMeta(postsRes.data.meta);
            } catch { } finally { setLoading(false); }
        };
        load();
    }, [category.slug, page]);

    return (
        <div className="min-h-screen bg-white">
            {/* Category header */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <h1 className="text-[24px] font-bold text-slate-800 mb-1">{category.name}</h1>
                    {category.description && <p className="text-[14px] text-slate-500">{category.description}</p>}
                </div>
                {/* Category tabs */}
                <div className="border-t border-green-100">
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
                            <Link href="/blog" className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors">
                                Tất cả
                            </Link>
                            {categories.map(cat => (
                                <Link key={cat.id} href={`/blog/${cat.slug}`}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${cat.slug === category.slug ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-green-50 hover:text-green-700'}`}>
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
                {/* Featured */}
                {featured.length > 0 && (
                    <section>
                        <h2 className="text-[16px] font-bold text-slate-800 mb-4">Bài viết nổi bật</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="md:col-span-3">
                                <Link href={`/blog/${featured[0].slug}`} className="group block">
                                    <div className="relative overflow-hidden rounded-xl aspect-[16/9] mb-3 bg-slate-100">
                                        {featured[0].thumbnail
                                            ? <img src={featured[0].thumbnail} alt={featured[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            : <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-50" />}
                                    </div>
                                    <p className="text-[11px] font-semibold text-green-600 uppercase mb-1">{featured[0].category?.name}</p>
                                    <h2 className="text-[18px] font-bold text-slate-800 line-clamp-2 group-hover:text-green-700 mb-2">{featured[0].title}</h2>
                                    {featured[0].description && <p className="text-[13px] text-slate-500 line-clamp-2">{featured[0].description}</p>}
                                    <p className="text-[12px] text-slate-400 mt-2">TopCV • {featured[0].publishedAt ? new Date(featured[0].publishedAt).toLocaleDateString('vi-VN') : ''}</p>
                                </Link>
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-4 divide-y divide-slate-100">
                                {featured.slice(1).map(p => (
                                    <Link key={p.id} href={`/blog/${p.slug}`} className="group flex gap-3 items-start pt-4 first:pt-0">
                                        <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                                            {p.thumbnail ? <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-green-50" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-semibold text-green-600 uppercase mb-0.5">{p.category?.name}</p>
                                            <h3 className="text-[13px] font-semibold text-slate-700 line-clamp-2 group-hover:text-green-700">{p.title}</h3>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('vi-VN') : ''}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* All posts */}
                <section>
                    <h2 className="text-[16px] font-bold text-slate-800 mb-4">Danh sách bài viết</h2>
                    {loading
                        ? <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="aspect-[4/3] bg-slate-100 rounded-xl animate-pulse" />
                                    <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                                    <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                                    <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                        : <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {posts.map(p => <PostCardGrid key={p.id} post={p} />)}
                        </div>
                    }
                    {meta && meta.lastPage > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {Array.from({ length: meta.lastPage }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    className={`w-8 h-8 rounded text-[13px] font-medium transition-colors ${p === page ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-green-50'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

/* ── Facebook SVG ── */
const IconFacebook = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);
const IconLinkedIn = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);
const IconTwitter = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const SUPPORT_LINKS = [
    { label: 'Sơ yếu lý lịch', href: '#' },
    { label: 'Hồ sơ xin việc', href: '#' },
    { label: 'Mẫu đơn xin việc', href: '#' },
    { label: 'Cách viết CV', href: '/tao-cv' },
    { label: 'Cách gửi Email xin việc', href: '#' },
    { label: 'Giới thiệu bản thân khi phỏng vấn', href: '#' },
    { label: 'Câu hỏi phỏng vấn', href: '#' },
];

/* ── Post detail page ──────────────────────────────────────── */
function PostDetail({ post, related, categories }) {
    const [tocOpen, setTocOpen] = useState(false);         // left sidebar TOC
    const [inlineTocOpen, setInlineTocOpen] = useState(true); // inline TOC inside article
    const [activeId, setActiveId] = useState('');
    const [copied, setCopied] = useState(false);
    const [jobKeyword, setJobKeyword] = useState('');
    const [provinces, setProvinces] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [readingProgress, setReadingProgress] = useState(0);

    // Inject IDs into heading tags in the HTML string and extract TOC items
    const { processedContent, headings } = useMemo(() => {
        if (!post?.content || typeof document === 'undefined') {
            return { processedContent: post?.content || '', headings: [] };
        }
        const div = document.createElement('div');
        div.innerHTML = post.content;
        const items = Array.from(div.querySelectorAll('h2, h3, h4')).map((el, i) => {
            const id = `heading-${i}`;
            el.id = id;
            return { id, text: el.textContent.trim(), level: el.tagName };
        });
        return { processedContent: div.innerHTML, headings: items };
    }, [post?.content]);

    // Track active heading via scroll position (offsetTop-based, more reliable than IntersectionObserver)
    useEffect(() => {
        if (!headings.length) return;
        const handleScroll = () => {
            const scrollTop = window.scrollY + 160;
            let current = headings[0].id;
            for (const h of headings) {
                const el = document.getElementById(h.id);
                if (el && el.offsetTop <= scrollTop) current = h.id;
            }
            setActiveId(current);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [headings]);

    // Reading progress bar
    useEffect(() => {
        const update = () => {
            const scrolled = window.scrollY;
            const total = document.body.scrollHeight - window.innerHeight;
            setReadingProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        return () => window.removeEventListener('scroll', update);
    }, []);

    // Fetch provinces
    useEffect(() => {
        import('@/services/province.service').then(m => {
            m.provinceService.getAll().then(data => setProvinces(data || [])).catch(() => { });
        });
    }, []);

    const articleRef = useRef(null);
    const [iconsLeft, setIconsLeft] = useState(null);

    // Measure article left edge to position fixed icons
    useEffect(() => {
        const update = () => {
            if (!articleRef.current) return;
            const rect = articleRef.current.getBoundingClientRect();
            setIconsLeft(Math.max(4, rect.left - 52));
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const copyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 140;
            window.scrollTo({ top, behavior: 'smooth' });
        }
        setTocOpen(false);
    };

    const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
    const shareTitle = encodeURIComponent(post.title);

    const TocItem = ({ h, compact = false }) => (
        <li>
            <button onClick={() => scrollTo(h.id)}
                style={{ transition: 'color 0.15s, padding-left 0.15s' }}
                className={`w-full text-left block leading-snug cursor-pointer
                    ${compact ? 'py-0.5 text-[12px]' : 'py-1.5 text-[13px]'}
                    ${h.level === 'H2' ? 'font-medium' : h.level === 'H3' ? 'pl-4' : 'pl-7'}
                    ${activeId === h.id ? 'text-green-600 font-semibold' : 'text-slate-600 hover:text-green-600'}`}>
                {h.text}
            </button>
        </li>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Reading progress bar */}
            <div
                className="fixed top-0 left-0 z-[100] h-[3px] bg-green-500 transition-[width] duration-100"
                style={{ width: `${readingProgress}%` }}
            />

            {/* Category tabs — sticky */}
            <div className="sticky top-[72px] z-30 bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2" style={{ scrollbarWidth: 'none' }}>
                        <Link href="/blog"
                            className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium text-slate-500 hover:bg-green-50 hover:text-green-700 transition-colors whitespace-nowrap">
                            Tất cả
                        </Link>
                        {categories.map(cat => (
                            <Link key={cat.id} href={`/blog/${cat.slug}`}
                                className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${cat.id === post.category?.id ? 'bg-green-600 text-white' : 'text-slate-500 hover:bg-green-50 hover:text-green-700'}`}>
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="border-b border-slate-100 bg-slate-50/60">
                <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-[12px] text-slate-400 flex-wrap">
                    <Link href="/" className="hover:text-green-600">Trang chủ</Link>
                    <ChevronRight size={11} />
                    <Link href="/blog" className="hover:text-green-600">Cẩm nang nghề nghiệp</Link>
                    {post.category && <>
                        <ChevronRight size={11} />
                        <Link href={`/blog/${post.category.slug}`} className="hover:text-green-600">{post.category.name}</Link>
                    </>}
                    <ChevronRight size={11} />
                    <span className="text-slate-600 line-clamp-1">{post.title}</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex gap-5 items-start">

                    {/* Placeholder to keep content from shifting */}
                    <div className="hidden md:block w-9 shrink-0" />

                    {/* ── Main content ── */}
                    <div className="flex-1 min-w-0" ref={articleRef}>
                        {post.category && (
                            <p className="text-[11px] font-bold text-green-600 uppercase tracking-widest mb-2">{post.category.name}</p>
                        )}
                        <h1 className="text-[26px] font-bold text-slate-800 leading-tight mb-3">{post.title}</h1>
                        <div className="flex items-center gap-3 text-[12px] text-slate-400 mb-6 pb-5 border-b border-slate-100">
                            <span className="font-medium text-slate-600">TopCV</span>
                            <span>•</span>
                            <span>
                                {post.publishedAt
                                    ? new Date(post.publishedAt).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
                                    : ''}
                            </span>
                            {post.minRead && (
                                <><span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={11} />{post.minRead} phút đọc
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Inline TOC */}
                        {headings.length > 0 && (
                            <div className="border border-slate-200 rounded-xl mb-6 overflow-hidden">
                                <button
                                    onClick={() => setInlineTocOpen(p => !p)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                                        <List size={15} className="text-slate-500" />
                                        Mục lục
                                    </span>
                                    <ChevronRight size={15} className={`text-slate-400 transition-transform ${inlineTocOpen ? 'rotate-90' : ''}`} />
                                </button>
                                {inlineTocOpen && (
                                    <ul className="px-4 py-3 space-y-0.5">
                                        {headings.map(h => <TocItem key={h.id} h={h} />)}
                                    </ul>
                                )}
                            </div>
                        )}

                        {post.thumbnail && (
                            <img src={post.thumbnail} alt={post.title}
                                className="w-full rounded-xl mb-6 object-cover"
                                style={{ maxHeight: '400px' }} />
                        )}

                        {/* Content */}
                        <div
                            className="blog-content"
                            style={{
                                fontSize: '15px',
                                lineHeight: '1.8',
                                color: '#1e293b',
                                fontFamily: "'Be Vietnam Pro', sans-serif",
                            }}
                            dangerouslySetInnerHTML={{ __html: processedContent }} />

                        <style>{`
                            .blog-content h1 { font-size: 24px; font-weight: 700; margin: 28px 0 12px; color: #0f172a; }
                            .blog-content h2 { font-size: 20px; font-weight: 700; margin: 24px 0 10px; color: #0f172a; }
                            .blog-content h3 { font-size: 17px; font-weight: 600; margin: 20px 0 8px; color: #1e293b; }
                            .blog-content h4 { font-size: 15px; font-weight: 600; margin: 16px 0 6px; color: #1e293b; }
                            .blog-content p { margin: 0 0 14px; }
                            .blog-content ul, .blog-content ol { padding-left: 20px; margin: 0 0 14px; }
                            .blog-content li { margin-bottom: 6px; }
                            .blog-content a { color: #16a34a; text-decoration: underline; }
                            .blog-content img { max-width: 100%; height: auto; border-radius: 10px; margin: 16px 0; display: block; }
                            .blog-content table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
                            .blog-content table td, .blog-content table th { border: 1px solid #e2e8f0; padding: 8px 12px; }
                            .blog-content table th { background: #f8fafc; font-weight: 600; }
                            .blog-content blockquote { border-left: 3px solid #16a34a; padding: 8px 16px; margin: 16px 0; background: #f0fdf4; color: #374151; border-radius: 0 6px 6px 0; }
                            .blog-content pre { background: #f8fafc; border-radius: 8px; padding: 16px; overflow-x: auto; font-size: 13px; margin: 16px 0; }
                            .blog-content code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 13px; }
                            .blog-content strong, .blog-content b { font-weight: 700; color: #0f172a; }
                        `}</style>

                        {/* Tags */}
                        {post.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-100">
                                {post.tags.map(tag => (
                                    <Badge key={tag.id} variant="outline" className="text-[12px] text-slate-500 hover:border-green-400 hover:text-green-600 cursor-pointer transition-colors">
                                        #{tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* In-article green CTA banner */}
                        <div style={{
                            margin: '32px 0 20px',
                            padding: '20px 24px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #00b14f 0%, #059669 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '20px',
                            boxShadow: '0 8px 30px rgba(0, 177, 79, 0.12)'
                        }} className="blog-cta-banner">
                            <div>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'white' }}>Tìm Kiếm Cơ Hội Việc Làm Mới Nhất</h4>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.9)' }}>
                                    Hơn 60.000+ tin tuyển dụng chất lượng cao đang chờ đón bạn ứng tuyển hôm nay.
                                </p>
                            </div>
                            <Link href="/tim-viec-lam-moi-nhat">
                                <button style={{
                                    background: 'white',
                                    color: '#00b14f',
                                    fontWeight: '700',
                                    fontSize: '12.5px',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    transition: 'transform 0.15s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    Khám phá ngay
                                </button>
                            </Link>
                        </div>

                        {/* DMCA copyright notice */}
                        <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3.5 border border-slate-200 mt-6 text-[12px] text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-[#00b14f]">TopCV Copyright</span>
                                <span>&copy; {new Date().getFullYear()} Bản quyền thuộc về TopCV Clone. Bảo lưu mọi quyền.</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <a href="https://www.dmca.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                    🛡️ DMCA Protected
                                </a>
                            </div>
                        </div>

                        {/* Related */}
                        {related.length > 0 && (
                            <section className="mt-10 pt-8 border-t border-slate-100">
                                <h2 className="text-[16px] font-bold text-slate-800 mb-4">Bài viết liên quan</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                    {related.map(p => (
                                        <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2">
                                                {p.thumbnail
                                                    ? <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    : <div className="w-full h-full bg-green-50" />}
                                            </div>
                                            <h3 className="text-[13px] font-semibold text-slate-700 line-clamp-2 group-hover:text-green-700 leading-snug">{p.title}</h3>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* ── Right sidebar ── */}
                    <div className="hidden lg:block w-[260px] shrink-0 sticky top-[130px] space-y-4">
                        {/* Tìm việc ngay */}
                        <div className="rounded-xl border border-slate-100 p-4 bg-white shadow-sm">
                            <p className="text-[13px] font-bold text-slate-700 mb-3">Tìm việc ngay</p>
                            <div className="space-y-2">
                                <input
                                    value={jobKeyword}
                                    onChange={e => setJobKeyword(e.target.value)}
                                    placeholder="Vị trí tuyển dụng, tên công ty..."
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-green-400 focus:ring-1 focus:ring-green-200"
                                />
                                <select
                                    value={selectedProvince}
                                    onChange={e => setSelectedProvince(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-green-400 focus:ring-1 focus:ring-green-200 bg-white text-slate-600">
                                    <option value="">Tất cả tỉnh/thành phố</option>
                                    {provinces.map(p => (
                                        <option key={p.code} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                                <Link href={`/tim-viec-lam?keyword=${encodeURIComponent(jobKeyword)}${selectedProvince ? `&location=${encodeURIComponent(selectedProvince)}` : ''}`}>
                                    <button className="w-full bg-green-600 hover:bg-green-700 text-white text-[13px] font-semibold py-2 rounded-lg transition-colors">
                                        Tìm kiếm
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Tài liệu hỗ trợ */}
                        {/* <div className="rounded-xl border border-slate-100 p-4 bg-white shadow-sm">
                            <p className="text-[13px] font-bold text-slate-700 mb-3">Tài liệu hỗ trợ tìm việc</p>
                            <ul className="space-y-2.5">
                                {SUPPORT_LINKS.map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href}
                                            className="flex items-center gap-2 text-[12px] text-slate-600 hover:text-green-600 transition-colors group">
                                            <BookOpen size={13} className="text-slate-300 group-hover:text-green-400 shrink-0" />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div> */}

                        {/* CTA */}
                        <div className="rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 p-4 text-white">
                            <p className="text-[13px] font-bold mb-1">Tạo CV miễn phí</p>
                            <p className="text-[11px] text-green-100 mb-3">50+ mẫu CV chuyên nghiệp, chỉnh sửa dễ dàng</p>
                            <Link href="/tao-cv">
                                <button className="w-full bg-white text-green-700 text-[12px] font-bold py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                                    Tạo CV ngay
                                </button>
                            </Link>
                        </div>

                        {/* Gross-Net Tool Banner */}
                        <div className="rounded-xl border border-slate-100 p-4 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Công cụ tiện ích</span>
                            <p className="text-[13px] font-bold text-slate-800 mb-0.5">Tính lương Gross &harr; Net</p>
                            <p className="text-[11.5px] text-slate-500 leading-relaxed">Công cụ quy đổi mức lương Gross sang Net nhanh chóng và chuẩn xác nhất.</p>
                            <Link href="/cong-cu/tinh-luong-gross-net">
                                <button className="w-full mt-1 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-[12px] font-bold py-1.5 rounded-lg transition-colors">
                                    Tính lương ngay
                                </button>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Fixed social icons strip ── */}
            {iconsLeft !== null && (
                <div className="hidden md:flex flex-col items-center gap-2"
                    style={{ position: 'fixed', top: '200px', left: `${iconsLeft}px`, zIndex: 31 }}>
                    <button onClick={copyLink} title={copied ? 'Đã sao chép!' : 'Sao chép link'}
                        style={{ transition: 'all 0.15s' }}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center ${copied ? 'border-green-400 text-green-600 bg-green-50' : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'}`}>
                        <Share2 size={13} />
                    </button>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                        style={{ transition: 'all 0.15s' }}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]">
                        <IconFacebook />
                    </a>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                        style={{ transition: 'all 0.15s' }}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]">
                        <IconLinkedIn />
                    </a>
                    <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer"
                        style={{ transition: 'all 0.15s' }}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-black hover:text-white hover:border-black">
                        <IconTwitter />
                    </a>
                    <div className="w-5 h-px bg-slate-200 my-0.5" />
                    <button onClick={() => setTocOpen(p => !p)} title="Mục lục"
                        style={{ transition: 'all 0.15s' }}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center ${tocOpen ? 'border-green-500 text-green-600 bg-green-50' : 'border-slate-200 text-slate-500 hover:border-green-400 hover:text-green-600'}`}>
                        <List size={13} />
                    </button>
                </div>
            )}

            {/* ── TOC drawer — slides in from left ── */}
            {headings.length > 0 && (
                <>
                    {/* Backdrop */}
                    {tocOpen && (
                        <div className="hidden md:block fixed inset-0"
                            style={{ zIndex: 39, background: 'transparent' }}
                            onClick={() => setTocOpen(false)} />
                    )}
                    <div className="hidden md:flex flex-col fixed top-0 left-0 h-full z-40 bg-white shadow-2xl"
                        style={{
                            width: '240px',
                            transform: tocOpen ? 'translateX(0)' : 'translateX(-100%)',
                            transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                            overflowY: 'auto',
                        }}>
                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-slate-100 shrink-0">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em]">Mục lục</p>
                            <button onClick={() => setTocOpen(false)}
                                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                        {/* TOC items */}
                        <ul className="px-4 py-4 space-y-0.5 flex-1">
                            {headings.map((h, i) => (
                                <li key={h.id}>
                                    <button onClick={() => scrollTo(h.id)}
                                        style={{ transition: 'color 0.15s, transform 0.15s', transitionDelay: tocOpen ? `${i * 18}ms` : '0ms' }}
                                        className={`w-full text-left py-1.5 text-[13px] leading-snug cursor-pointer block
                                            ${h.level === 'H2' ? 'font-medium' : h.level === 'H3' ? 'pl-4' : 'pl-7'}
                                            ${activeId === h.id ? 'text-green-600 font-semibold' : 'text-slate-600 hover:text-green-600'}`}>
                                        {h.text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Main router ───────────────────────────────────────────── */
export default function BlogSlugPage() {
    const { slug } = useParams();
    const [type, setType] = useState(null); // 'category' | 'post' | 'notfound'
    const [data, setData] = useState(null);
    const [related, setRelated] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const load = async () => {
            setType(null);
            try {
                const catRes = await blogService.listCategories();
                setCategories(catRes.data);

                const cat = catRes.data.find(c => c.slug === slug);
                if (cat) { setType('category'); setData(cat); return; }

                // try as post slug
                const postRes = await blogService.getPost(slug);
                const post = postRes.data;
                setData(post);

                const relRes = await blogService.getRelated(post.id);
                setRelated(relRes.data);
                setType('post');
            } catch {
                setType('notfound');
            }
        };
        load();
    }, [slug]);

    if (type === null) return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex gap-5 items-start">
                    <div className="flex-1 min-w-0 space-y-4">
                        <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
                        <div className="h-8 w-3/4 bg-slate-100 rounded animate-pulse" />
                        <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
                        <div className="h-64 w-full bg-slate-100 rounded-xl animate-pulse mt-4" />
                        <div className="space-y-2 pt-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className={`h-4 bg-slate-100 rounded animate-pulse ${i === 5 ? 'w-2/3' : 'w-full'}`} />
                            ))}
                        </div>
                    </div>
                    <div className="hidden lg:block w-72 shrink-0 space-y-4">
                        <div className="h-48 w-full bg-slate-100 rounded-xl animate-pulse" />
                        <div className="h-32 w-full bg-slate-100 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (type === 'notfound') return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-3">
                <p className="text-[18px] font-bold text-slate-700">Không tìm thấy trang</p>
                <Link href="/blog"><Button variant="outline" size="sm">Về trang blog</Button></Link>
            </div>
        </div>
    );

    if (type === 'category') return <CategoryPage category={data} categories={categories} />;
    return <PostDetail post={data} related={related} categories={categories} />;
}
