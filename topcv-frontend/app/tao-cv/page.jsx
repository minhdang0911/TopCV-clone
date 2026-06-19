'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { resumeService } from '@/services/resume.service';
import TieuChuanTemplate from '@/app/components/cv/templates/TieuChuan';
import TieuChuanItKNTemplate from '@/app/components/cv/templates/TieuChuanItKN';
import AnTuongTemplate from '@/app/components/cv/templates/AnTuong';
import ThanhLichTemplate from '@/app/components/cv/templates/ThanhLich';
import HienDaiTemplate from '@/app/components/cv/templates/HienDai';
import ChuyenNghiepTemplate from '@/app/components/cv/templates/ChuyenNghiep';
import GocCanhTemplate from '@/app/components/cv/templates/GocCanh';
import ThamVongTemplate from '@/app/components/cv/templates/ThamVong';
import KinhDoanhTemplate from '@/app/components/cv/templates/KinhDoanh';
import KinhDoanh2Template from '@/app/components/cv/templates/KinhDoanh2';
import KinhDoanh3Template from '@/app/components/cv/templates/KinhDoanh3';
import KinhDoanh4Template from '@/app/components/cv/templates/KinhDoanh4';
import LapTrinhVienCVTemplate from '@/app/components/cv/templates/LapTrinhVienCV';
import LapTrinhVienCV2Template from '@/app/components/cv/templates/LapTrinhVienCV2';
import LapTrinhVienCV3Template from '@/app/components/cv/templates/LapTrinhVienCV3';
import LapTrinhVienCV4Template from '@/app/components/cv/templates/LapTrinhVienCV4';
import KeToanTemplate from '@/app/components/cv/templates/KeToan';
import KeToan2Template from '@/app/components/cv/templates/KeToan2';
import KeToan3Template from '@/app/components/cv/templates/KeToan3';
import KeToan4Template from '@/app/components/cv/templates/KeToan4';
import MarketingCVTemplate from '@/app/components/cv/templates/MarketingCV';
import MarketingCV2Template from '@/app/components/cv/templates/MarketingCV2';
import MarketingCV3Template from '@/app/components/cv/templates/MarketingCV3';
import MarketingCV4Template from '@/app/components/cv/templates/MarketingCV4';
import robo from '@/app/assests/img/toppy-list-mau-cv.png';

const A4_W = 794;
const A4_H = 1123;
// Scale so the CV thumbnail fills the card width (~300px grid column)
const SCALE = 0.36;
const THUMB_W = Math.round(A4_W * SCALE);
const THUMB_H = Math.round(A4_H * SCALE);

const MODAL_SCALE = 0.58;
const MODAL_W = Math.round(A4_W * MODAL_SCALE);
const MODAL_H = Math.round(A4_H * MODAL_SCALE);

const SAMPLE_CONTENT = {
    personalInfo: {
        fullName: 'Nguyễn Văn Minh',
        title: 'Senior Frontend Developer',
        email: 'minhkv@gmail.com',
        phone: '0901 234 567',
        address: 'Hồ Chí Minh',
        linkedin: 'linkedin.com/in/minhkv',
        github: 'github.com/minhkv',
    },
    objective:
        'Kỹ sư Frontend với 3+ năm kinh nghiệm React và Next.js, chuyên xây dựng các ứng dụng web hiệu năng cao và trải nghiệm người dùng tốt. Mong muốn đóng góp vào sản phẩm có tác động lớn trong môi trường Agile năng động, học hỏi liên tục.',
    experiences: [
        {
            id: '1',
            position: 'Senior Frontend Developer',
            company: 'VNG Corporation',
            startDate: '06/2022',
            endDate: '',
            isCurrent: true,
            description:
                '- Phát triển tính năng mới cho Zalo Web với 20M+ người dùng\n- Tối ưu performance, giảm 40% load time bằng code splitting và lazy loading\n- Mentor 2 junior developers, tổ chức knowledge sharing sessions\n- Thiết kế hệ thống component library dùng chung cho 3 sản phẩm',
        },
        {
            id: '2',
            position: 'Frontend Developer',
            company: 'FPT Software',
            startDate: '09/2020',
            endDate: '05/2022',
            isCurrent: false,
            description:
                '- Xây dựng giao diện hệ thống quản lý nội bộ cho 500+ nhân viên\n- Tích hợp REST API với React/Redux, giảm 30% thời gian tải trang\n- Implement CI/CD pipeline với GitHub Actions\n- Cải thiện UX dựa trên user research, tăng 25% user retention',
        },
        {
            id: '3',
            position: 'Frontend Intern',
            company: 'Tiki Corporation',
            startDate: '06/2020',
            endDate: '08/2020',
            isCurrent: false,
            description:
                '- Hỗ trợ phát triển tính năng frontend cho trang thương mại điện tử\n- Fix bugs và viết unit tests cho module thanh toán',
        },
    ],
    education: [
        {
            id: '1',
            school: 'Đại học Bách Khoa TP.HCM',
            degree: 'Kỹ sư Công nghệ Thông tin',
            gpa: '3.6/4.0',
            startDate: '2016',
            endDate: '2020',
            description: 'Thủ khoa kỳ 3 năm 2018. Giải nhì cuộc thi lập trình ACM-ICPC cấp trường.',
        },
    ],
    skills: [
        { id: '1', name: 'React / Next.js', level: 5 },
        { id: '2', name: 'TypeScript', level: 4 },
        { id: '3', name: 'Node.js / Express', level: 3 },
        { id: '4', name: 'Tailwind CSS', level: 4 },
        { id: '5', name: 'Git / CI-CD', level: 4 },
        { id: '6', name: 'Docker / AWS', level: 3 },
    ],
    languages: [
        { id: '1', name: 'Tiếng Anh', level: 'B2 (IELTS 6.5)' },
        { id: '2', name: 'Tiếng Nhật', level: 'N4' },
    ],
    certifications: [
        { id: '1', name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2023' },
        { id: '2', name: 'Meta Frontend Developer', issuer: 'Meta / Coursera', date: '2022' },
    ],
    activities: [
        {
            id: '1',
            role: 'Trưởng ban kỹ thuật',
            organization: 'CLB IT Bách Khoa',
            description:
                'Tổ chức workshop hàng tháng về web development cho 200+ thành viên. Xây dựng hệ thống quản lý sự kiện nội bộ.',
        },
    ],
};

const KINH_DOANH_CONTENT = {
    personalInfo: { fullName: 'Trần Thị Thanh Tâm', title: 'Nhân Viên Kinh Doanh', email: 'tamttt@gmail.com', phone: '0912 345 678', address: 'TP. Hồ Chí Minh', linkedin: 'linkedin.com/in/tamttt' },
    objective: 'Nhân viên Kinh doanh với 4 năm kinh nghiệm trong lĩnh vực B2B và FMCG. Đã đạt vượt 135% KPI doanh số năm 2023. Mong muốn phát triển trong môi trường bán hàng chuyên nghiệp, đóng góp tăng trưởng doanh thu bền vững.',
    experiences: [
        { id: '1', position: 'Senior Sales Executive', company: 'Unilever Việt Nam', startDate: '01/2022', endDate: '', isCurrent: true, description: '- Quản lý 120+ khách hàng doanh nghiệp khu vực TP.HCM\n- Đạt 135% KPI doanh số Q3/2023, doanh thu 2.4 tỷ đồng/tháng\n- Phát triển 30 khách hàng mới, tỷ lệ giữ chân khách hàng 92%\n- Dẫn dắt team 5 nhân viên sales junior' },
        { id: '2', position: 'Sales Executive', company: 'P&G Việt Nam', startDate: '06/2020', endDate: '12/2021', isCurrent: false, description: '- Phụ trách kênh MT/GT khu vực Quận 1, 3, 5\n- Tăng trưởng doanh số 28% so với cùng kỳ năm trước\n- Đạt giải "Nhân viên xuất sắc" Q2/2021' },
    ],
    education: [{ id: '1', school: 'Đại học Kinh tế TP.HCM', degree: 'Cử nhân Quản trị Kinh doanh', gpa: '3.4/4.0', startDate: '2016', endDate: '2020' }],
    skills: [{ id: '1', name: 'Kỹ năng đàm phán', level: 5 }, { id: '2', name: 'Quản lý khách hàng CRM', level: 4 }, { id: '3', name: 'Lập kế hoạch kinh doanh', level: 4 }, { id: '4', name: 'Phân tích thị trường', level: 3 }, { id: '5', name: 'Thuyết trình & thuyết phục', level: 5 }],
    languages: [{ id: '1', name: 'Tiếng Anh', level: 'B2 – Thương mại' }],
    certifications: [{ id: '1', name: 'Chứng chỉ Bán hàng Chuyên nghiệp', issuer: 'Sales Academy VN', date: '2022' }],
    activities: [],
};

const LAP_TRINH_VIEN_CONTENT = {
    personalInfo: { fullName: 'Nguyễn Văn Minh', title: 'Backend Developer', email: 'minhkv@gmail.com', phone: '0901 234 567', address: 'TP. Hồ Chí Minh', linkedin: 'linkedin.com/in/minhkv', github: 'github.com/minhkv' },
    objective: 'Backend Developer với 3 năm kinh nghiệm Node.js và Python. Đam mê xây dựng hệ thống phân tán hiệu suất cao, thiết kế RESTful API và tối ưu cơ sở dữ liệu. Mong muốn đóng góp vào sản phẩm công nghệ có quy mô lớn.',
    experiences: [
        { id: '1', position: 'Backend Developer', company: 'VNG Corporation', startDate: '06/2022', endDate: '', isCurrent: true, description: '- Phát triển microservices cho Zalo Pay phục vụ 5M+ giao dịch/ngày\n- Tối ưu query PostgreSQL, giảm 60% thời gian phản hồi API\n- Thiết kế hệ thống cache Redis, tăng throughput lên 10,000 RPS\n- Code review và mentor 3 developers junior' },
        { id: '2', position: 'Junior Developer', company: 'FPT Software', startDate: '07/2021', endDate: '05/2022', isCurrent: false, description: '- Xây dựng REST API Node.js/Express cho 3 dự án outsource Nhật\n- Viết unit test Jest, đạt coverage 85%\n- Implement CI/CD pipeline GitHub Actions' },
    ],
    education: [{ id: '1', school: 'ĐH Bách Khoa TP.HCM', degree: 'Kỹ sư Công nghệ Thông tin', gpa: '3.6/4.0', startDate: '2017', endDate: '2021', description: 'Thủ khoa khoa CNTT năm 2021' }],
    skills: [{ id: '1', name: 'Node.js / Express', level: 5 }, { id: '2', name: 'Python / FastAPI', level: 4 }, { id: '3', name: 'PostgreSQL / Redis', level: 4 }, { id: '4', name: 'Docker / K8s', level: 3 }, { id: '5', name: 'AWS / GCP', level: 3 }, { id: '6', name: 'Git / CI-CD', level: 5 }],
    languages: [{ id: '1', name: 'Tiếng Anh', level: 'B2 (IELTS 6.5)' }, { id: '2', name: 'Tiếng Nhật', level: 'N4' }],
    certifications: [{ id: '1', name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2023' }, { id: '2', name: 'Google Cloud Associate', issuer: 'Google', date: '2022' }],
    activities: [{ id: '1', role: 'Contributor', organization: 'Open Source VN Community', description: 'Đóng góp 20+ PR cho các dự án mã nguồn mở Node.js trong nước' }],
};

const KE_TOAN_CONTENT = {
    personalInfo: { fullName: 'Lê Thị Hương Giang', title: 'Kế Toán Tổng Hợp', email: 'giangketo@gmail.com', phone: '0976 543 210', address: 'Hà Nội', linkedin: 'linkedin.com/in/giangketo' },
    objective: 'Kế toán tổng hợp với 5 năm kinh nghiệm tại doanh nghiệp FDI và sản xuất. Thành thạo chuẩn mực kế toán Việt Nam (VAS) và IFRS. Chuyên sâu lập báo cáo tài chính, kiểm soát nội bộ và quyết toán thuế.',
    experiences: [
        { id: '1', position: 'Kế Toán Tổng Hợp', company: 'Samsung Electronics Việt Nam', startDate: '03/2021', endDate: '', isCurrent: true, description: '- Lập báo cáo tài chính hợp nhất theo chuẩn IFRS cho 3 công ty thành viên\n- Quản lý dòng tiền hàng tháng 50+ tỷ đồng, đảm bảo tuân thủ quy định tài chính\n- Phối hợp kiểm toán PwC, không phát sinh sai sót trọng yếu 3 năm liên tiếp\n- Xây dựng quy trình kế toán nội bộ, tiết kiệm 15% chi phí vận hành' },
        { id: '2', position: 'Kế Toán', company: 'Công ty TNHH Sản xuất ABC', startDate: '01/2019', endDate: '02/2021', isCurrent: false, description: '- Hạch toán toàn bộ nghiệp vụ kế toán phát sinh\n- Lập quyết toán thuế TNDN, GTGT, TNCN hàng năm\n- Làm việc với phần mềm FAST Accounting, MISA SME' },
    ],
    education: [{ id: '1', school: 'Đại học Kinh tế Quốc dân', degree: 'Cử nhân Kế toán – Kiểm toán', gpa: '3.5/4.0', startDate: '2015', endDate: '2019', description: 'Tốt nghiệp loại Giỏi, xếp hạng Top 5% khoa' }],
    skills: [{ id: '1', name: 'Kế toán tổng hợp VAS/IFRS', level: 5 }, { id: '2', name: 'MISA / SAP / FAST', level: 5 }, { id: '3', name: 'Excel tài chính nâng cao', level: 5 }, { id: '4', name: 'Quyết toán thuế', level: 4 }, { id: '5', name: 'Kiểm soát nội bộ', level: 4 }, { id: '6', name: 'Báo cáo tài chính', level: 5 }],
    languages: [{ id: '1', name: 'Tiếng Anh', level: 'B2 – Thương mại' }, { id: '2', name: 'Tiếng Trung', level: 'HSK 3' }],
    certifications: [{ id: '1', name: 'Chứng chỉ Kế toán viên (CPA)', issuer: 'Bộ Tài chính', date: '2022' }, { id: '2', name: 'Chứng chỉ Thuế', issuer: 'Tổng cục Thuế', date: '2021' }],
    activities: [],
};

const MARKETING_CONTENT = {
    personalInfo: { fullName: 'Phạm Ngọc Anh Thư', title: 'Digital Marketing Manager', email: 'thumarketing@gmail.com', phone: '0938 765 432', address: 'TP. Hồ Chí Minh', linkedin: 'linkedin.com/in/thumarketing' },
    objective: 'Digital Marketing Manager với 5 năm kinh nghiệm xây dựng chiến lược thương hiệu và performance marketing. Thành thạo Google Ads, Meta Ads, SEO/SEM và marketing automation. Đã quản lý ngân sách ads 5 tỷ/tháng, đạt ROAS trung bình 4.8x.',
    experiences: [
        { id: '1', position: 'Digital Marketing Manager', company: 'Shopee Việt Nam', startDate: '07/2022', endDate: '', isCurrent: true, description: '- Quản lý chiến lược Digital Marketing cho 5 ngành hàng chiến lược\n- Điều hành ngân sách ads 5 tỷ/tháng, đạt ROAS 4.8x\n- Tăng trưởng organic traffic 85% thông qua chiến lược SEO tổng thể\n- Dẫn dắt team 8 người gồm content, ads, và analytics' },
        { id: '2', position: 'Marketing Executive', company: 'Lazada Việt Nam', startDate: '03/2020', endDate: '06/2022', isCurrent: false, description: '- Quản lý campaign Facebook/Google Ads, tối ưu CPA giảm 35%\n- Xây dựng nội dung và quản lý fanpage 500K+ followers\n- Phân tích dữ liệu Google Analytics, Data Studio' },
    ],
    education: [{ id: '1', school: 'Đại học Kinh tế TP.HCM', degree: 'Cử nhân Marketing', gpa: '3.5/4.0', startDate: '2016', endDate: '2020' }],
    skills: [{ id: '1', name: 'Google / Meta Ads', level: 5 }, { id: '2', name: 'SEO / SEM', level: 5 }, { id: '3', name: 'Content Marketing', level: 4 }, { id: '4', name: 'Marketing Automation', level: 4 }, { id: '5', name: 'Google Analytics 4', level: 5 }, { id: '6', name: 'Canva / Figma', level: 3 }],
    languages: [{ id: '1', name: 'Tiếng Anh', level: 'C1 – Thành thạo' }],
    certifications: [{ id: '1', name: 'Google Ads Certified', issuer: 'Google', date: '2023' }, { id: '2', name: 'Meta Blueprint', issuer: 'Meta', date: '2023' }],
    activities: [{ id: '1', role: 'Speaker', organization: 'Vietnam Marketing Summit', description: 'Trình bày chủ đề "Performance Marketing trong thời đại AI" — 500+ người tham dự' }],
};

const TEMPLATES = [
    {
        id: 'tieu-chuan',
        name: 'Tiêu chuẩn',
        Component: TieuChuanTemplate,
        description: 'Gọn gàng, rõ ràng, phù hợp mọi ngành nghề',
        colors: ['#00b14f', '#1e3a5f', '#c0392b', '#2471a3', '#6c3483'],
        tags: ['Mẫu CV Chuyên nghiệp'],
    },
    {
        id: 'tieu-chuan-it-kn',
        name: 'Tiêu chuẩn (ít kinh nghiệm)',
        Component: TieuChuanItKNTemplate,
        description: 'Tối ưu cho sinh viên, fresher',
        colors: ['#00b14f', '#1e3a5f', '#e67e22', '#16a085'],
        tags: ['Mẫu CV Đơn giản'],
    },
    {
        id: 'an-tuong',
        name: 'Ấn tượng',
        Component: AnTuongTemplate,
        description: 'Nổi bật với header đậm, phù hợp senior',
        colors: ['#1e3a5f', '#111827', '#7b2d8b', '#c0392b'],
        tags: ['Mẫu CV Ấn tượng'],
    },
    {
        id: 'thanh-lich',
        name: 'Thanh lịch',
        Component: ThanhLichTemplate,
        description: 'Tối giản, thanh lịch, bố cục một cột',
        colors: ['#00b14f', '#1e3a5f', '#64748b', '#7c3aed'],
        tags: ['Mẫu CV Đơn giản'],
    },
    {
        id: 'hien-dai',
        name: 'Hiện đại',
        Component: HienDaiTemplate,
        description: 'Hai cột hiện đại, sidebar xám nhẹ',
        colors: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'],
        tags: ['Mẫu CV Ấn tượng'],
    },
    {
        id: 'chuyen-nghiep',
        name: 'Chuyên nghiệp',
        Component: ChuyenNghiepTemplate,
        description: 'Header màu nổi bật, phong cách doanh nghiệp',
        colors: ['#1e3a5f', '#374151', '#b91c1c', '#065f46'],
        tags: ['Mẫu CV Chuyên nghiệp'],
    },
    {
        id: 'goc-canh',
        name: 'Góc cạnh',
        Component: GocCanhTemplate,
        description: 'Sidebar tối, phong cách mạnh mẽ',
        colors: ['#1e293b', '#1e3a5f', '#7c3aed', '#be123c'],
        tags: ['Mẫu CV Ấn tượng'],
    },
    {
        id: 'tham-vong',
        name: 'Tham vọng',
        Component: ThamVongTemplate,
        description: 'Header tối, timeline thanh lịch',
        colors: ['#1e293b', '#0f4c75', '#6d28d9', '#064e3b'],
        tags: ['Mẫu CV Chuyên nghiệp'],
    },
    { id: 'kinh-doanh', name: 'Kinh doanh 1', Component: KinhDoanhTemplate, description: 'Header năng động, nhấn mạnh thành tích kinh doanh', colors: ['#d35400', '#c0392b', '#e67e22', '#27ae60'], tags: ['Nhân viên kinh doanh'], sampleContent: KINH_DOANH_CONTENT },
    { id: 'kinh-doanh-2', name: 'Kinh doanh 2', Component: KinhDoanh2Template, description: 'Sidebar tối sang trọng, bảng kỹ năng nổi bật', colors: ['#c0392b', '#d35400', '#7c3aed', '#1e3a5f'], tags: ['Nhân viên kinh doanh'], sampleContent: KINH_DOANH_CONTENT },
    { id: 'kinh-doanh-3', name: 'Kinh doanh 3', Component: KinhDoanh3Template, description: 'Tối giản hiện đại, viền màu tinh tế', colors: ['#27ae60', '#00b14f', '#16a085', '#2471a3'], tags: ['Nhân viên kinh doanh'], sampleContent: KINH_DOANH_CONTENT },
    { id: 'kinh-doanh-4', name: 'Kinh doanh 4', Component: KinhDoanh4Template, description: 'Hai cột cân đối, thành tích kinh doanh nổi bật', colors: ['#e67e22', '#d35400', '#c0392b', '#7c3aed'], tags: ['Nhân viên kinh doanh'], sampleContent: KINH_DOANH_CONTENT },
    { id: 'lap-trinh-vien-cv', name: 'Lập trình viên 1', Component: LapTrinhVienCVTemplate, description: 'Sidebar tối phong cách tech, kỹ năng nổi bật', colors: ['#2c3e7a', '#1e293b', '#16a085', '#6d28d9'], tags: ['Lập trình viên'], sampleContent: LAP_TRINH_VIEN_CONTENT },
    { id: 'lap-trinh-vien-cv-2', name: 'Lập trình viên 2', Component: LapTrinhVienCV2Template, description: 'Header dark terminal, kỹ năng dạng code tag', colors: ['#16a085', '#0f4c75', '#2c3e7a', '#6d28d9'], tags: ['Lập trình viên'], sampleContent: LAP_TRINH_VIEN_CONTENT },
    { id: 'lap-trinh-vien-cv-3', name: 'Lập trình viên 3', Component: LapTrinhVienCV3Template, description: 'Header trung tâm, tech stack chip cloud ấn tượng', colors: ['#6d28d9', '#2c3e7a', '#16a085', '#0ea5e9'], tags: ['Lập trình viên'], sampleContent: LAP_TRINH_VIEN_CONTENT },
    { id: 'lap-trinh-vien-cv-4', name: 'Lập trình viên 4', Component: LapTrinhVienCV4Template, description: 'Gradient header, hai cột thông tin rõ ràng', colors: ['#0ea5e9', '#2c3e7a', '#8b5cf6', '#16a085'], tags: ['Lập trình viên'], sampleContent: LAP_TRINH_VIEN_CONTENT },
    { id: 'ke-toan', name: 'Kế toán 1', Component: KeToanTemplate, description: 'Bố cục chỉnh chu, chuyên nghiệp cho ngành tài chính', colors: ['#1a3a6b', '#374151', '#065f46', '#7c3aed'], tags: ['Nhân viên kế toán'], sampleContent: KE_TOAN_CONTENT },
    { id: 'ke-toan-2', name: 'Kế toán 2', Component: KeToan2Template, description: 'Sidebar tối, chứng chỉ nổi bật phong cách ngân hàng', colors: ['#374151', '#1a3a6b', '#1e293b', '#065f46'], tags: ['Nhân viên kế toán'], sampleContent: KE_TOAN_CONTENT },
    { id: 'ke-toan-3', name: 'Kế toán 3', Component: KeToan3Template, description: 'Timeline chấm tròn, bảng giáo dục dạng kẻ sọc', colors: ['#065f46', '#1a3a6b', '#374151', '#2471a3'], tags: ['Nhân viên kế toán'], sampleContent: KE_TOAN_CONTENT },
    { id: 'ke-toan-4', name: 'Kế toán 4', Component: KeToan4Template, description: 'Hai cột, chứng chỉ dạng card viền màu tinh tế', colors: ['#7c3aed', '#1a3a6b', '#374151', '#065f46'], tags: ['Nhân viên kế toán'], sampleContent: KE_TOAN_CONTENT },
    { id: 'marketing-cv', name: 'Marketing 1', Component: MarketingCVTemplate, description: 'Sidebar sáng tạo, phong cách chuyên viên marketing', colors: ['#7c3aed', '#be123c', '#d97706', '#0ea5e9'], tags: ['Chuyên viên marketing'], sampleContent: MARKETING_CONTENT },
    { id: 'marketing-cv-2', name: 'Marketing 2', Component: MarketingCV2Template, description: 'Dải chỉ số thành tích, layout một cột impactful', colors: ['#be123c', '#7c3aed', '#d97706', '#0ea5e9'], tags: ['Chuyên viên marketing'], sampleContent: MARKETING_CONTENT },
    { id: 'marketing-cv-3', name: 'Marketing 3', Component: MarketingCV3Template, description: 'Họa tiết trang trí, sidebar kỹ năng sáng tạo', colors: ['#d97706', '#be123c', '#7c3aed', '#0ea5e9'], tags: ['Chuyên viên marketing'], sampleContent: MARKETING_CONTENT },
    { id: 'marketing-cv-4', name: 'Marketing 4', Component: MarketingCV4Template, description: 'Header diagonal clipPath, bố cục hai cột bold', colors: ['#0ea5e9', '#7c3aed', '#be123c', '#d97706'], tags: ['Chuyên viên marketing'], sampleContent: MARKETING_CONTENT },
];

const FILTER_TAGS = ['Tất cả', 'Mẫu CV Đơn giản', 'Mẫu CV Ấn tượng', 'Mẫu CV Chuyên nghiệp', 'Nhân viên kinh doanh', 'Lập trình viên', 'Nhân viên kế toán', 'Chuyên viên marketing'];

const LINHVUC_MAP = {
    'kinh-doanh': 'Nhân viên kinh doanh',
    'lap-trinh-vien': 'Lập trình viên',
    'ke-toan': 'Nhân viên kế toán',
    'marketing': 'Chuyên viên marketing',
};

const STYLE_MAP = {
    'don-gian': 'Mẫu CV Đơn giản',
    'an-tuong': 'Mẫu CV Ấn tượng',
    'chuyen-nghiep': 'Mẫu CV Chuyên nghiệp',
};

function Thumbnail({ Component, color, content, scale = SCALE }) {
    const w = Math.round(A4_W * scale);
    const h = Math.round(A4_H * scale);
    return (
        <div style={{ width: `${w}px`, height: `${h}px`, overflow: 'hidden', background: 'white', margin: '0 auto' }}>
            <div
                style={{
                    width: `${A4_W}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
            >
                <Component content={content || SAMPLE_CONTENT} color={color} />
            </div>
        </div>
    );
}

export default function TaoCvPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated } = useAuthStore();
    const linhvuc = searchParams.get('linhvuc');
    const style = searchParams.get('style');
    const urlFilter = linhvuc ? (LINHVUC_MAP[linhvuc] || null) : style ? (STYLE_MAP[style] || null) : null;
    const [localFilter, setLocalFilter] = useState('Tất cả');
    const activeFilter = urlFilter || localFilter;

    const [selectedColors, setSelectedColors] = useState(Object.fromEntries(TEMPLATES.map((t) => [t.id, t.colors[0]])));
    const [creating, setCreating] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleUseTemplate = async (templateId, color) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        setCreating(true);
        try {
            const res = await resumeService.create({ type: 'resume', template: templateId, color });
            router.push(`/tao-cv/${res.data.id}`);
        } catch {
            setCreating(false);
        }
    };

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '40px 16px' }}>
            <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>
                        Mẫu CV xin việc tiếng Việt chuẩn 2026
                    </h1>
                    <p style={{ fontSize: '15px', color: '#6b7280' }}>
                        Tuyển chọn mẫu CV đa dạng phong cách, giúp bạn tạo dấu ấn cá nhân
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginBottom: '32px',
                        justifyContent: 'center',
                    }}
                >
                    {FILTER_TAGS.map((tag) => {
                        const active = activeFilter === tag;
                        return (
                            <button
                                key={tag}
                                onClick={() => {
                                        setLocalFilter(tag);
                                        if (urlFilter && tag !== urlFilter) router.replace('/tao-cv', { scroll: false });
                                    }}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '20px',
                                    border: active ? 'none' : '1px solid #d1d5db',
                                    background: active ? '#00b14f' : 'white',
                                    color: active ? 'white' : '#374151',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '24px',
                    }}
                >
                    {TEMPLATES.filter((tpl) => activeFilter === 'Tất cả' || tpl.tags.includes(activeFilter)).map((tpl) => {
                        const color = selectedColors[tpl.id];
                        return (
                            <div
                                key={tpl.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    transition: 'box-shadow 0.2s, transform 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.14)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div
                                    style={{ background: '#f0f0f0', overflow: 'hidden', cursor: 'pointer' }}
                                    onClick={() => setPreview({ tpl, color })}
                                >
                                    <Thumbnail Component={tpl.Component} color={color} content={tpl.sampleContent} />
                                </div>

                                <div style={{ padding: '14px 16px 0' }}>
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                        {tpl.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                style={{
                                                    padding: '3px 9px',
                                                    background: '#f0fdf4',
                                                    color: '#15803d',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '700',
                                            color: '#111827',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        {tpl.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                                        {tpl.description}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        padding: '0 16px 12px',
                                        display: 'flex',
                                        gap: '6px',
                                        alignItems: 'center',
                                    }}
                                >
                                    {tpl.colors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setSelectedColors((prev) => ({ ...prev, [tpl.id]: c }))}
                                            style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: c,
                                                border: color === c ? '2.5px solid #111827' : '2px solid transparent',
                                                cursor: 'pointer',
                                                outline: color === c ? '2px solid white' : 'none',
                                                outlineOffset: '-4px',
                                                flexShrink: 0,
                                            }}
                                        />
                                    ))}
                                </div>

                                <div style={{ padding: '0 12px 14px', display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setPreview({ tpl, color })}
                                        style={{
                                            flex: 1,
                                            padding: '9px',
                                            border: '1px solid #d1d5db',
                                            background: 'white',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            color: '#374151',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                        }}
                                    >
                                        Xem trước
                                    </button>
                                    <button
                                        onClick={() => handleUseTemplate(tpl.id, color)}
                                        disabled={creating}
                                        style={{
                                            flex: 1,
                                            padding: '9px',
                                            border: 'none',
                                            background: '#00b14f',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            color: 'white',
                                            cursor: creating ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                        }}
                                    >
                                        Dùng mẫu này
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Preview modal */}
            {preview && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: '32px 16px',
                        overflowY: 'auto',
                    }}
                    onClick={() => setPreview(null)}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '24px',
                            alignItems: 'flex-start',
                            maxWidth: '1000px',
                            width: '100%',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* CV preview */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                                style={{
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                    width: `${MODAL_W}px`,
                                }}
                            >
                                <div style={{ width: `${MODAL_W}px`, height: `${MODAL_H}px`, overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${A4_W}px`,
                                            transform: `scale(${MODAL_SCALE})`,
                                            transformOrigin: 'top left',
                                            pointerEvents: 'none',
                                            userSelect: 'none',
                                        }}
                                    >
                                        <preview.tpl.Component content={preview.tpl.sampleContent || SAMPLE_CONTENT} color={preview.color} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side panel */}
                        <div
                            style={{
                                width: '260px',
                                flexShrink: 0,
                                background: 'white',
                                borderRadius: '12px',
                                padding: '24px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                            }}
                        >
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                                {preview.tpl.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>
                                {preview.tpl.description}
                            </div>

                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#6b7280',
                                    marginBottom: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                Màu sắc
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                {preview.tpl.colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setPreview((p) => ({ ...p, color: c }))}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: c,
                                            border: preview.color === c ? '3px solid #111827' : '2px solid transparent',
                                            cursor: 'pointer',
                                            outline: preview.color === c ? '2px solid white' : 'none',
                                            outlineOffset: '-4px',
                                        }}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    handleUseTemplate(preview.tpl.id, preview.color);
                                    setPreview(null);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#00b14f',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    marginBottom: '10px',
                                }}
                            >
                                Dùng mẫu này
                            </button>
                            <button
                                onClick={() => setPreview(null)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: 'white',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    color: '#374151',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                }}
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
