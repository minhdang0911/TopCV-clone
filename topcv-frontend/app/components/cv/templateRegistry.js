import TieuChuan from './templates/TieuChuan';
import TieuChuanItKN from './templates/TieuChuanItKN';
import AnTuong from './templates/AnTuong';
import ThanhLich from './templates/ThanhLich';
import HienDai from './templates/HienDai';
import ChuyenNghiep from './templates/ChuyenNghiep';
import GocCanh from './templates/GocCanh';
import ThamVong from './templates/ThamVong';
import KinhDoanh from './templates/KinhDoanh';
import KinhDoanh2 from './templates/KinhDoanh2';
import KinhDoanh3 from './templates/KinhDoanh3';
import KinhDoanh4 from './templates/KinhDoanh4';
import LapTrinhVienCV from './templates/LapTrinhVienCV';
import LapTrinhVienCV2 from './templates/LapTrinhVienCV2';
import LapTrinhVienCV3 from './templates/LapTrinhVienCV3';
import LapTrinhVienCV4 from './templates/LapTrinhVienCV4';
import KeToan from './templates/KeToan';
import KeToan2 from './templates/KeToan2';
import KeToan3 from './templates/KeToan3';
import KeToan4 from './templates/KeToan4';
import MarketingCV from './templates/MarketingCV';
import MarketingCV2 from './templates/MarketingCV2';
import MarketingCV3 from './templates/MarketingCV3';
import MarketingCV4 from './templates/MarketingCV4';

export const TEMPLATE_REGISTRY = {
    'tieu-chuan': TieuChuan,
    'tieu-chuan-it-kn': TieuChuanItKN,
    'an-tuong': AnTuong,
    'thanh-lich': ThanhLich,
    'hien-dai': HienDai,
    'chuyen-nghiep': ChuyenNghiep,
    'goc-canh': GocCanh,
    'tham-vong': ThamVong,
    'kinh-doanh': KinhDoanh,
    'kinh-doanh-2': KinhDoanh2,
    'kinh-doanh-3': KinhDoanh3,
    'kinh-doanh-4': KinhDoanh4,
    'lap-trinh-vien-cv': LapTrinhVienCV,
    'lap-trinh-vien-cv-2': LapTrinhVienCV2,
    'lap-trinh-vien-cv-3': LapTrinhVienCV3,
    'lap-trinh-vien-cv-4': LapTrinhVienCV4,
    'ke-toan': KeToan,
    'ke-toan-2': KeToan2,
    'ke-toan-3': KeToan3,
    'ke-toan-4': KeToan4,
    'marketing-cv': MarketingCV,
    'marketing-cv-2': MarketingCV2,
    'marketing-cv-3': MarketingCV3,
    'marketing-cv-4': MarketingCV4,
};

export const TEMPLATE_META = [
    { id: 'tieu-chuan', name: 'Tiêu chuẩn', colors: ['#00b14f', '#1e3a5f', '#c0392b', '#2471a3', '#6c3483'], tags: ['Mẫu CV Chuyên nghiệp'] },
    { id: 'tieu-chuan-it-kn', name: 'Tiêu chuẩn (ít KN)', colors: ['#00b14f', '#1e3a5f', '#e67e22', '#16a085'], tags: ['Mẫu CV Đơn giản'] },
    { id: 'an-tuong', name: 'Ấn tượng', colors: ['#1e3a5f', '#111827', '#7b2d8b', '#c0392b'], tags: ['Mẫu CV Ấn tượng'] },
    { id: 'thanh-lich', name: 'Thanh lịch', colors: ['#00b14f', '#1e3a5f', '#64748b', '#7c3aed'], tags: ['Mẫu CV Đơn giản'] },
    { id: 'hien-dai', name: 'Hiện đại', colors: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'], tags: ['Mẫu CV Ấn tượng'] },
    { id: 'chuyen-nghiep', name: 'Chuyên nghiệp', colors: ['#1e3a5f', '#374151', '#b91c1c', '#065f46'], tags: ['Mẫu CV Chuyên nghiệp'] },
    { id: 'goc-canh', name: 'Góc cạnh', colors: ['#1e293b', '#1e3a5f', '#7c3aed', '#be123c'], tags: ['Mẫu CV Ấn tượng'] },
    { id: 'tham-vong', name: 'Tham vọng', colors: ['#1e293b', '#0f4c75', '#6d28d9', '#064e3b'], tags: ['Mẫu CV Chuyên nghiệp', 'Mẫu CV Ấn tượng'] },
    { id: 'kinh-doanh', name: 'Kinh doanh 1', colors: ['#d35400', '#c0392b', '#e67e22', '#27ae60'], tags: ['Nhân viên kinh doanh'] },
    { id: 'kinh-doanh-2', name: 'Kinh doanh 2', colors: ['#c0392b', '#d35400', '#7c3aed', '#1e3a5f'], tags: ['Nhân viên kinh doanh'] },
    { id: 'kinh-doanh-3', name: 'Kinh doanh 3', colors: ['#27ae60', '#00b14f', '#16a085', '#2471a3'], tags: ['Nhân viên kinh doanh'] },
    { id: 'kinh-doanh-4', name: 'Kinh doanh 4', colors: ['#e67e22', '#d35400', '#c0392b', '#7c3aed'], tags: ['Nhân viên kinh doanh'] },
    { id: 'lap-trinh-vien-cv', name: 'Lập trình viên 1', colors: ['#2c3e7a', '#1e293b', '#16a085', '#6d28d9'], tags: ['Lập trình viên'] },
    { id: 'lap-trinh-vien-cv-2', name: 'Lập trình viên 2', colors: ['#16a085', '#0f4c75', '#2c3e7a', '#6d28d9'], tags: ['Lập trình viên'] },
    { id: 'lap-trinh-vien-cv-3', name: 'Lập trình viên 3', colors: ['#6d28d9', '#2c3e7a', '#16a085', '#0ea5e9'], tags: ['Lập trình viên'] },
    { id: 'lap-trinh-vien-cv-4', name: 'Lập trình viên 4', colors: ['#0ea5e9', '#2c3e7a', '#8b5cf6', '#16a085'], tags: ['Lập trình viên'] },
    { id: 'ke-toan', name: 'Kế toán 1', colors: ['#1a3a6b', '#374151', '#065f46', '#7c3aed'], tags: ['Nhân viên kế toán'] },
    { id: 'ke-toan-2', name: 'Kế toán 2', colors: ['#374151', '#1a3a6b', '#1e293b', '#065f46'], tags: ['Nhân viên kế toán'] },
    { id: 'ke-toan-3', name: 'Kế toán 3', colors: ['#065f46', '#1a3a6b', '#374151', '#2471a3'], tags: ['Nhân viên kế toán'] },
    { id: 'ke-toan-4', name: 'Kế toán 4', colors: ['#7c3aed', '#1a3a6b', '#374151', '#065f46'], tags: ['Nhân viên kế toán'] },
    { id: 'marketing-cv', name: 'Marketing 1', colors: ['#7c3aed', '#be123c', '#d97706', '#0ea5e9'], tags: ['Chuyên viên marketing'] },
    { id: 'marketing-cv-2', name: 'Marketing 2', colors: ['#be123c', '#7c3aed', '#d97706', '#0ea5e9'], tags: ['Chuyên viên marketing'] },
    { id: 'marketing-cv-3', name: 'Marketing 3', colors: ['#d97706', '#be123c', '#7c3aed', '#0ea5e9'], tags: ['Chuyên viên marketing'] },
    { id: 'marketing-cv-4', name: 'Marketing 4', colors: ['#0ea5e9', '#7c3aed', '#be123c', '#d97706'], tags: ['Chuyên viên marketing'] },
];

export function getTemplate(id) {
    return TEMPLATE_REGISTRY[id] || TieuChuan;
}
