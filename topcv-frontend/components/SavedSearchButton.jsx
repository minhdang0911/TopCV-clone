'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Trash2, Search, ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { savedSearchesService } from '@/services/saved-searches.service';
import useAuthStore from '@/stores/auth.store';

const GREEN = '#00b14f';

/**
 * SavedSearchButton – nút "Lưu tìm kiếm" + dropdown danh sách đã lưu.
 *
 * Props:
 *  - currentFilters: object chứa các filter hiện tại (search, industryId, provinceCode, ...)
 *  - onApply(filters): callback khi người dùng chọn một tìm kiếm đã lưu
 *  - label: (optional) label hiển thị trong ô nhập tên (default = "Tìm kiếm của tôi")
 */
export default function SavedSearchButton({ currentFilters = {}, onApply, label }) {
    const { isAuthenticated, role } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showNameInput, setShowNameInput] = useState(false);
    const [inputName, setInputName] = useState('');
    const wrapperRef = useRef(null);

    // Fetch list khi mở dropdown
    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const res = await savedSearchesService.getAll();
            setItems(res.data?.data || []);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) fetchList();
    }, [open, fetchList]);

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
                setShowNameInput(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Chỉ hiển thị cho candidate đã đăng nhập — phải đặt SAU tất cả hooks
    if (!isAuthenticated || role !== 'CANDIDATE') return null;

    const handleSave = async () => {
        const name = inputName.trim() || (label ?? 'Tìm kiếm của tôi');
        if (!name) { toast.error('Vui lòng nhập tên tìm kiếm'); return; }

        // Loại bỏ các filter rỗng/undefined
        const cleanFilters = Object.fromEntries(
            Object.entries(currentFilters).filter(([, v]) => v !== undefined && v !== '' && v !== null)
        );

        setSaving(true);
        try {
            const res = await savedSearchesService.create(name, cleanFilters);
            setItems(prev => [res.data.data, ...prev]);
            setInputName('');
            setShowNameInput(false);
            toast.success(`Đã lưu tìm kiếm "${name}"`);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name, e) => {
        e.stopPropagation();
        try {
            await savedSearchesService.remove(id);
            setItems(prev => prev.filter(i => i.id !== id));
            toast.success(`Đã xoá "${name}"`);
        } catch {
            toast.error('Xoá thất bại');
        }
    };

    const handleApply = (filters) => {
        onApply?.(filters);
        setOpen(false);
        setShowNameInput(false);
    };

    const hasFilters = Object.values(currentFilters).some(v => v !== undefined && v !== '' && v !== null);


    return (
        <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
            {/* Trigger button */}
            <button
                onClick={() => { setOpen(o => !o); setShowNameInput(false); }}
                title="Tìm kiếm đã lưu"
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                    border: `1.5px solid ${open ? GREEN : '#e5e7eb'}`,
                    background: open ? '#f0fdf4' : 'white',
                    color: open ? GREEN : '#374151',
                    fontSize: '13px', fontWeight: '500',
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                    if (!open) { e.currentTarget.style.borderColor = '#86efac'; e.currentTarget.style.background = '#f9fafb'; }
                }}
                onMouseLeave={e => {
                    if (!open) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; }
                }}
            >
                <Bookmark size={15} fill={open ? GREEN : 'none'} color={open ? GREEN : '#6b7280'} />
                Tìm kiếm đã lưu
                <ChevronDown size={13} color="#9ca3af"
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    width: '320px', background: 'white',
                    border: '1px solid #e5e7eb', borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    zIndex: 100, overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                            Tìm kiếm đã lưu
                        </span>
                        {hasFilters && !showNameInput && (
                            <button
                                onClick={() => setShowNameInput(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '5px 10px', borderRadius: '6px', border: `1px solid ${GREEN}`,
                                    background: 'white', color: GREEN, fontSize: '12px',
                                    fontWeight: '600', cursor: 'pointer',
                                }}
                            >
                                <BookmarkCheck size={13} />
                                Lưu bộ lọc hiện tại
                            </button>
                        )}
                    </div>

                    {/* Name input form */}
                    {showNameInput && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                                Đặt tên cho bộ lọc này:
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <input
                                    autoFocus
                                    placeholder={label ?? 'VD: Dev HCM lương 20M+'}
                                    value={inputName}
                                    onChange={e => setInputName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowNameInput(false); }}
                                    style={{
                                        flex: 1, padding: '7px 10px', borderRadius: '6px',
                                        border: '1px solid #d1d5db', fontSize: '13px', outline: 'none',
                                    }}
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        padding: '7px 12px', borderRadius: '6px', border: 'none',
                                        background: saving ? '#86efac' : GREEN, color: 'white',
                                        fontSize: '12px', fontWeight: '600', cursor: saving ? 'default' : 'pointer',
                                    }}
                                >
                                    {saving ? '...' : 'Lưu'}
                                </button>
                                <button
                                    onClick={() => setShowNameInput(false)}
                                    style={{ padding: '7px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', lineHeight: 0 }}
                                >
                                    <X size={13} color="#6b7280" />
                                </button>
                            </div>
                            {/* Preview filters */}
                            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {Object.entries(currentFilters)
                                    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
                                    .map(([k, v]) => (
                                        <span key={k} style={{
                                            background: '#e5e7eb', color: '#374151',
                                            fontSize: '11px', padding: '2px 7px', borderRadius: '4px',
                                        }}>
                                            {k}: {String(v)}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* List */}
                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                                Đang tải...
                            </div>
                        ) : items.length === 0 ? (
                            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                                <Search size={28} color="#e5e7eb" style={{ display: 'block', margin: '0 auto 8px' }} />
                                <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 4px' }}>
                                    Chưa có tìm kiếm nào được lưu
                                </p>
                                <p style={{ fontSize: '12px', color: '#d1d5db', margin: 0 }}>
                                    Thiết lập bộ lọc rồi bấm "Lưu bộ lọc hiện tại"
                                </p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleApply(item.filters)}
                                    style={{
                                        padding: '10px 16px', cursor: 'pointer',
                                        borderBottom: '1px solid #f9fafb',
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        transition: 'background 0.12s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                                >
                                    <Search size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {Object.entries(item.filters)
                                                .filter(([, v]) => v !== undefined && v !== '' && v !== null)
                                                .map(([k, v]) => `${k}: ${v}`)
                                                .join(' · ') || 'Không có bộ lọc'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(item.id, item.name, e)}
                                        title="Xoá"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0, lineHeight: 0 }}
                                        onMouseEnter={e => { e.currentTarget.querySelector('svg').style.color = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.querySelector('svg').style.color = '#d1d5db'; }}
                                    >
                                        <Trash2 size={14} color="#d1d5db" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
