'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

export default function AdminBlogCategoriesPage() {
    const [cats, setCats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', slug: '', description: '' });
    const [editing, setEditing] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminService.adminListPosts({ limit: 1 });
            // Load categories from API
            const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/categories`);
            const data = await catRes.json();
            setCats(Array.isArray(data) ? data : data.data ?? []);
        } catch { toast.error('Không thể tải danh mục'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        if (!form.name) { toast.error('Vui lòng nhập tên danh mục'); return; }
        try {
            if (editing) {
                await adminService.updateCategory(editing.id, form);
                toast.success('Đã cập nhật danh mục');
            } else {
                await adminService.createCategory(form);
                toast.success('Đã tạo danh mục');
            }
            setForm({ name: '', slug: '', description: '' });
            setEditing(null);
            load();
        } catch { toast.error('Thao tác thất bại'); }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Xóa danh mục "${name}"?`)) return;
        try {
            await adminService.deleteCategory(id);
            toast.success('Đã xóa danh mục');
            load();
        } catch { toast.error('Xóa thất bại'); }
    };

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Danh mục Blog</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
                {/* Table */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f0f0f0' }}>
                                {['Tên danh mục', 'Slug', 'Số bài viết', 'Thao tác'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Đang tải...</td></tr>}
                            {!loading && cats.map((c, i) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                    <td style={{ padding: '11px 14px', fontWeight: 500, color: '#111' }}>{c.name}</td>
                                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{c.slug}</td>
                                    <td style={{ padding: '11px 14px', textAlign: 'center', color: '#6b7280' }}>{c._count?.posts ?? c.postCount ?? '—'}</td>
                                    <td style={{ padding: '11px 14px', display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => { setEditing(c); setForm({ name: c.name, slug: c.slug ?? '', description: c.description ?? '' }); }}
                                            style={{ padding: '4px 12px', borderRadius: 6, background: '#e0f2fe', color: '#0369a1', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                        >Sửa</button>
                                        <button
                                            onClick={() => handleDelete(c.id, c.name)}
                                            style={{ padding: '4px 12px', borderRadius: 6, background: '#fef2f2', color: '#ef4444', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                        >Xóa</button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && cats.length === 0 && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Chưa có danh mục</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* Form */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 16 }}>
                        {editing ? `Sửa: ${editing.name}` : 'Tạo danh mục mới'}
                    </h3>
                    <form onSubmit={e => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Tên danh mục *</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tên danh mục" style={inputFull} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Slug</label>
                            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="ten-danh-muc" style={inputFull} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Mô tả</label>
                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả ngắn" rows={3} style={{ ...inputFull, resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="submit" style={btnGreen}>{editing ? 'Lưu thay đổi' : 'Tạo danh mục'}</button>
                            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '' }); }} style={btnGhost}>Hủy</button>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const inputFull = { width: '100%', padding: '9px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const btnGreen = { padding: '9px 20px', borderRadius: 8, background: '#00b14f', color: 'white', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
const btnGhost = { padding: '9px 16px', borderRadius: 8, background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
