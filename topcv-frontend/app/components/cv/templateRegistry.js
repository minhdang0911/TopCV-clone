import TieuChuan from './templates/TieuChuan';
import TieuChuanItKN from './templates/TieuChuanItKN';
import AnTuong from './templates/AnTuong';
import ThanhLich from './templates/ThanhLich';
import HienDai from './templates/HienDai';
import ChuyenNghiep from './templates/ChuyenNghiep';
import GocCanh from './templates/GocCanh';
import ThamVong from './templates/ThamVong';

export const TEMPLATE_REGISTRY = {
    'tieu-chuan': TieuChuan,
    'tieu-chuan-it-kn': TieuChuanItKN,
    'an-tuong': AnTuong,
    'thanh-lich': ThanhLich,
    'hien-dai': HienDai,
    'chuyen-nghiep': ChuyenNghiep,
    'goc-canh': GocCanh,
    'tham-vong': ThamVong,
};

export const TEMPLATE_META = [
    { id: 'tieu-chuan', name: 'Tiêu chuẩn', colors: ['#00b14f', '#1e3a5f', '#c0392b', '#2471a3', '#6c3483'], tags: ['Phổ biến', 'Chuyên nghiệp'] },
    { id: 'tieu-chuan-it-kn', name: 'Tiêu chuẩn (ít KN)', colors: ['#00b14f', '#1e3a5f', '#e67e22', '#16a085'], tags: ['Sinh viên', 'Fresher'] },
    { id: 'an-tuong', name: 'Ấn tượng', colors: ['#1e3a5f', '#111827', '#7b2d8b', '#c0392b'], tags: ['Ấn tượng', 'Sáng tạo'] },
    { id: 'thanh-lich', name: 'Thanh lịch', colors: ['#00b14f', '#1e3a5f', '#64748b', '#7c3aed'], tags: ['Đơn giản', 'Thanh lịch'] },
    { id: 'hien-dai', name: 'Hiện đại', colors: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'], tags: ['Hiện đại', 'Sáng tạo'] },
    { id: 'chuyen-nghiep', name: 'Chuyên nghiệp', colors: ['#1e3a5f', '#374151', '#b91c1c', '#065f46'], tags: ['Chuyên nghiệp'] },
    { id: 'goc-canh', name: 'Góc cạnh', colors: ['#1e293b', '#1e3a5f', '#7c3aed', '#be123c'], tags: ['Ấn tượng', 'Mạnh mẽ'] },
    { id: 'tham-vong', name: 'Tham vọng', colors: ['#1e293b', '#0f4c75', '#6d28d9', '#064e3b'], tags: ['Chuyên nghiệp', 'Ấn tượng'] },
];

export function getTemplate(id) {
    return TEMPLATE_REGISTRY[id] || TieuChuan;
}
