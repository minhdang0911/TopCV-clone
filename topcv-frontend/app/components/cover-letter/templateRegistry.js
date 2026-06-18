import TinhTe1 from './templates/TinhTe1';
import TinhTe2 from './templates/TinhTe2';
import LapTrinhVien1 from './templates/LapTrinhVien1';
import LapTrinhVien2 from './templates/LapTrinhVien2';
import MauSac1 from './templates/MauSac1';
import MauSac2 from './templates/MauSac2';
import ThoiThuong1 from './templates/ThoiThuong1';
import ChuyenNghiep1 from './templates/ChuyenNghiep1';
import SangTao1 from './templates/SangTao1';

export const CL_TEMPLATE_META = [
    {
        id: 'tinh-te-1',
        name: 'Tinh tế 1',
        tags: ['Chuyên nghiệp', 'Sáng tạo'],
        defaultColor: '#1e3a5f',
        defaultFont: 'Muli',
        colors: ['#1e3a5f', '#c0392b', '#2c3e7a', '#e67e22'],
    },
    {
        id: 'tinh-te-2',
        name: 'Tinh tế 2',
        tags: ['Chuyên nghiệp', 'Sáng tạo'],
        defaultColor: '#1e3a5f',
        defaultFont: 'Muli',
        colors: ['#1e3a5f', '#c0392b', '#2c3e7a', '#e67e22'],
    },
    {
        id: 'lap-trinh-vien-1',
        name: 'Lập trình viên 1',
        tags: ['Chuyên nghiệp', 'Sáng tạo'],
        defaultColor: '#2c3e7a',
        defaultFont: 'Source Code Pro',
        colors: ['#2c3e7a', '#1e3a5f', '#16a085', '#8e44ad'],
    },
    {
        id: 'lap-trinh-vien-2',
        name: 'Lập trình viên 2',
        tags: ['Chuyên nghiệp', 'Sáng tạo'],
        defaultColor: '#2c3e7a',
        defaultFont: 'Roboto',
        colors: ['#2c3e7a', '#1e3a5f', '#c0392b', '#16a085'],
    },
    {
        id: 'mau-sac-1',
        name: 'Màu sắc 1',
        tags: ['Màu sắc', 'Chuyên nghiệp'],
        defaultColor: '#e67e22',
        defaultFont: 'Open Sans',
        colors: ['#e67e22', '#c0392b', '#2c3e7a', '#27ae60'],
    },
    {
        id: 'mau-sac-2',
        name: 'Màu sắc 2',
        tags: ['Màu sắc', 'Chuyên nghiệp'],
        defaultColor: '#27ae60',
        defaultFont: 'Be Vietnam Pro',
        colors: ['#27ae60', '#e67e22', '#c0392b', '#2c3e7a'],
    },
    {
        id: 'thoi-thuong-1',
        name: 'Thời thượng',
        tags: ['Đơn giản', 'Hiện đại'],
        defaultColor: '#00b14f',
        defaultFont: 'Be Vietnam Pro',
        colors: ['#00b14f', '#1e3a5f', '#e67e22', '#7c3aed'],
    },
    {
        id: 'chuyen-nghiep-1',
        name: 'Chuyên nghiệp',
        tags: ['Chuyên nghiệp'],
        defaultColor: '#1e3a5f',
        defaultFont: 'Roboto',
        colors: ['#1e3a5f', '#374151', '#b91c1c', '#065f46'],
    },
    {
        id: 'sang-tao-1',
        name: 'Sáng tạo',
        tags: ['Màu sắc', 'Sáng tạo'],
        defaultColor: '#e67e22',
        defaultFont: 'Open Sans',
        colors: ['#e67e22', '#7c3aed', '#be123c', '#0ea5e9'],
    },
];

export const CL_TEMPLATE_REGISTRY = {
    'tinh-te-1': TinhTe1,
    'tinh-te-2': TinhTe2,
    'lap-trinh-vien-1': LapTrinhVien1,
    'lap-trinh-vien-2': LapTrinhVien2,
    'mau-sac-1': MauSac1,
    'mau-sac-2': MauSac2,
    'thoi-thuong-1': ThoiThuong1,
    'chuyen-nghiep-1': ChuyenNghiep1,
    'sang-tao-1': SangTao1,
};

export const FONT_OPTIONS = [
    { value: 'Muli', label: 'Muli' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Source Code Pro', label: 'Source Code Pro' },
    { value: 'Be Vietnam Pro', label: 'Be Vietnam Pro' },
    { value: 'Open Sans', label: 'Open Sans' },
];

export const DEFAULT_CL_CONTENT = {
    avatarUrl: null,
    fullName: 'NGUYỄN VĂN A',
    jobTitle: 'Nhân Viên Kinh Doanh',
    phone: '1900068889',
    email: 'hotro@topcv.vn',
    address: 'Số 10, đường 10, TopCV',
    recipientName: '[Tên]',
    department: '[Vị trí / Phòng ban]',
    company: '[Tên Công Ty]',
    companyAddress: '[Địa chỉ]',
    position: '[Vị trí công việc]',
    body: 'Thông qua ..., tôi được biết Quý Công ty đang cần tuyển vị trí [Tên vị trí công việc]. Tôi mong muốn được thử sức mình trong môi trường làm việc hết sức năng động của Quý Công ty. Với trình độ và kinh nghiệm hiện có, tôi tự tin có thể đảm nhiệm tốt vai trò này tại công ty [Tên công ty].\n\nNhư đã đề cập trong hồ sơ đính kèm, tôi có nhiều kinh nghiệm làm việc với các công ty ... ở vị trí .... Vị trí này đã cho tôi... [bạn viết ra những kinh nghiệm nổi trội phù hợp với vị trí ứng tuyển] với thành tích [bạn nêu thành tích tốt nhất bạn có được]. Ngoài ra, tôi còn có kinh nghiệm về ... trong suốt thời gian làm việc với công ty .... Là một trong nhiều sinh viên tốt nghiệp hàng đầu của trường Đại Học ..., tôi hoàn toàn tự tin với vốn kiến thức về lĩnh vực ... của mình.\n\nThêm vào đó, tôi có một năm kinh nghiệm làm việc cho một công ty kinh doanh ... ở vị trí ... sau khi tốt nghiệp. Tôi tin rằng đó là những nền tảng quý báu có thể giúp tôi hiểu rõ và đáp ứng tốt nhu cầu khách hàng của Quý Công ty.\n\nCảm ơn ông/bà đã dành thời gian quý báu để xem xét thư xin việc này. Tôi rất mong ông/bà có thể sắp xếp một cuộc phỏng vấn trực tiếp gần đây nhất để tôi có thể trình bày rõ hơn về bản thân cũng như tìm hiểu thêm các yêu cầu chi tiết cho vị trí [Tên vị trí công việc] của [Tên công ty].\n\nTrân trọng. Xin cảm ơn!',
};

export function getCLTemplate(id) {
    return CL_TEMPLATE_REGISTRY[id] || TinhTe1;
}
