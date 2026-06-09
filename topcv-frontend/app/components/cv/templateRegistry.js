import TieuChuan from './templates/TieuChuan';
import TieuChuanItKN from './templates/TieuChuanItKN';
import AnTuong from './templates/AnTuong';

export const TEMPLATE_REGISTRY = {
    'tieu-chuan': TieuChuan,
    'tieu-chuan-it-kn': TieuChuanItKN,
    'an-tuong': AnTuong,
};

export const TEMPLATE_META = [
    {
        id: 'tieu-chuan',
        name: 'Tieu chuan',
        colors: ['#00b14f', '#1e3a5f', '#c0392b', '#2471a3', '#6c3483'],
    },
    {
        id: 'tieu-chuan-it-kn',
        name: 'Tieu chuan (it kinh nghiem)',
        colors: ['#00b14f', '#1e3a5f', '#e67e22', '#16a085'],
    },
    {
        id: 'an-tuong',
        name: 'An tuong',
        colors: ['#1e3a5f', '#111827', '#7b2d8b', '#c0392b'],
    },
];

export function getTemplate(id) {
    return TEMPLATE_REGISTRY[id] || TieuChuan;
}
