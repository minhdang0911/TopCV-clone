'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, X, Crown, Zap, Sparkles, AlertTriangle } from 'lucide-react';
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
const SCALE = 0.35;
const THUMB_W = Math.round(A4_W * SCALE);
const THUMB_H = Math.round(A4_H * SCALE);
const MODAL_SCALE = 0.72;
const MODAL_W = Math.round(A4_W * MODAL_SCALE);
const MODAL_H = Math.round(A4_H * MODAL_SCALE);

const SAMPLE_CONTENT = {
    personalInfo: { fullName: 'Nguyễn Văn Minh', title: 'Senior Frontend Developer', email: 'minhkv@gmail.com', phone: '0901 234 567', address: 'Hồ Chí Minh', linkedin: 'linkedin.com/in/minhkv', github: 'github.com/minhkv' },
    objective: 'Kỹ sư Frontend với 3+ năm kinh nghiệm React và Next.js, chuyên xây dựng các ứng dụng web hiệu năng cao và trải nghiệm người dùng tốt. Mong muốn đóng góp vào sản phẩm có tác động lớn trong môi trường Agile năng động, học hỏi liên tục.',
    experiences: [
        { id: '1', position: 'Senior Frontend Developer', company: 'VNG Corporation', startDate: '06/2022', endDate: '', isCurrent: true, description: '- Phát triển tính năng mới cho Zalo Web với 20M+ người dùng\n- Tối ưu performance, giảm 40% load time bằng code splitting và lazy loading\n- Mentor 2 junior developers, tổ chức knowledge sharing sessions\n- Thiết kế hệ thống component library dùng chung cho 3 sản phẩm' },
        { id: '2', position: 'Frontend Developer', company: 'FPT Software', startDate: '09/2020', endDate: '05/2022', isCurrent: false, description: '- Xây dựng giao diện hệ thống quản lý nội bộ cho 500+ nhân viên\n- Tích hợp REST API với React/Redux, giảm 30% thời gian tải trang\n- Implement CI/CD pipeline với GitHub Actions\n- Cải thiện UX dựa trên user research, tăng 25% user retention' },
        { id: '3', position: 'Frontend Intern', company: 'Tiki Corporation', startDate: '06/2020', endDate: '08/2020', isCurrent: false, description: '- Hỗ trợ phát triển tính năng frontend cho trang thương mại điện tử\n- Fix bugs và viết unit tests cho module thanh toán' },
    ],
    education: [{ id: '1', school: 'Đại học Bách Khoa TP.HCM', degree: 'Kỹ sư Công nghệ Thông tin', gpa: '3.6/4.0', startDate: '2016', endDate: '2020', description: 'Thủ khoa kỳ 3 năm 2018. Giải nhì cuộc thi lập trình ACM-ICPC cấp trường.' }],
    skills: [{ id: '1', name: 'React / Next.js', level: 5 }, { id: '2', name: 'TypeScript', level: 4 }, { id: '3', name: 'Node.js / Express', level: 3 }, { id: '4', name: 'Tailwind CSS', level: 4 }, { id: '5', name: 'Git / CI-CD', level: 4 }, { id: '6', name: 'Docker / AWS', level: 3 }],
    languages: [{ id: '1', name: 'Tiếng Anh', level: 'B2 (IELTS 6.5)' }, { id: '2', name: 'Tiếng Nhật', level: 'N4' }],
    certifications: [{ id: '1', name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2023' }, { id: '2', name: 'Meta Frontend Developer', issuer: 'Meta / Coursera', date: '2022' }],
    activities: [{ id: '1', role: 'Trưởng ban kỹ thuật', organization: 'CLB IT Bách Khoa', description: 'Tổ chức workshop hàng tháng về web development cho 200+ thành viên. Xây dựng hệ thống quản lý sự kiện nội bộ.' }],
};

const KINH_DOANH_CONTENT = {
    personalInfo: { fullName: 'Trần Thị Thanh Tâm', title: 'Nhân Viên Kinh Doanh', email: 'tamttt@gmail.com', phone: '0912 345 678', address: 'TP. Hồ Chí Minh', linkedin: 'linkedin.com/in/tamttt' },
    objective: 'Nhân viên Kinh doanh với 4 năm kinh nghiệm trong lĩnh vực B2B và FMCG. Đã đạt vượt 135% KPI doanh số năm 2023.',
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
    objective: 'Backend Developer với 3 năm kinh nghiệm Node.js và Python. Đam mê xây dựng hệ thống phân tán hiệu suất cao, thiết kế RESTful API và tối ưu cơ sở dữ liệu.',
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
    objective: 'Kế toán tổng hợp với 5 năm kinh nghiệm tại doanh nghiệp FDI và sản xuất. Thành thạo chuẩn mực kế toán Việt Nam (VAS) và IFRS.',
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
    { id: 'tieu-chuan', name: 'Tiêu chuẩn', Component: TieuChuanTemplate, description: 'Gọn gàng, rõ ràng, phù hợp mọi ngành nghề', colors: ['#00b14f', '#1e3a5f', '#c0392b', '#2471a3', '#6c3483'], tags: ['Mẫu CV Chuyên nghiệp'] },
    { id: 'tieu-chuan-it-kn', name: 'Tiêu chuẩn (ít kinh nghiệm)', Component: TieuChuanItKNTemplate, description: 'Tối ưu cho sinh viên, fresher', colors: ['#00b14f', '#1e3a5f', '#e67e22', '#16a085'], tags: ['Mẫu CV Đơn giản'] },
    { id: 'an-tuong', name: 'Ấn tượng', Component: AnTuongTemplate, description: 'Nổi bật với header đậm, phù hợp senior', colors: ['#1e3a5f', '#111827', '#7b2d8b', '#c0392b'], tags: ['Mẫu CV Ấn tượng'] },
    { id: 'thanh-lich', name: 'Thanh lịch', Component: ThanhLichTemplate, description: 'Tối giản, thanh lịch, bố cục một cột', colors: ['#00b14f', '#1e3a5f', '#64748b', '#7c3aed'], tags: ['Mẫu CV Đơn giản'] },
    { id: 'hien-dai', name: 'Hiện đại', Component: HienDaiTemplate, description: 'Hai cột hiện đại, sidebar xám nhẹ', colors: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'], tags: ['Mẫu CV Ấn tượng'] },
    { id: 'chuyen-nghiep', name: 'Chuyên nghiệp', Component: ChuyenNghiepTemplate, description: 'Header màu nổi bật, phong cách doanh nghiệp', colors: ['#1e3a5f', '#374151', '#b91c1c', '#065f46'], tags: ['Mẫu CV Chuyên nghiệp'] },
    { id: 'goc-canh', name: 'Góc cạnh', Component: GocCanhTemplate, description: 'Sidebar tối, phong cách mạnh mẽ', colors: ['#1e293b', '#1e3a5f', '#7c3aed', '#be123c'], tags: ['Mẫu CV Ấn tượng'] },
    { id: 'tham-vong', name: 'Tham vọng', Component: ThamVongTemplate, description: 'Header tối, timeline thanh lịch', colors: ['#1e293b', '#0f4c75', '#6d28d9', '#064e3b'], tags: ['Mẫu CV Chuyên nghiệp'] },
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
const LINHVUC_MAP = { 'kinh-doanh': 'Nhân viên kinh doanh', 'lap-trinh-vien': 'Lập trình viên', 'ke-toan': 'Nhân viên kế toán', 'marketing': 'Chuyên viên marketing' };
const STYLE_MAP = { 'don-gian': 'Mẫu CV Đơn giản', 'an-tuong': 'Mẫu CV Ấn tượng', 'chuyen-nghiep': 'Mẫu CV Chuyên nghiệp' };

const PLAN_LIMITS_CV = { FREE: 6, PRO: 12, PREMIUM: 20 };

// ─── Limit Modal ──────────────────────────────────────────────────────────────
function LimitModal({ plan, limit, onClose }) {
    const isUpgradable = plan === 'FREE' || plan === 'PRO';
    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.3)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top gradient */}
                <div style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', padding: '28px 28px 24px', textAlign: 'center' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <Crown size={26} color="white" />
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', margin: '0 0 6px' }}>Đã đạt giới hạn CV</h2>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                        Gói <strong style={{ color: 'white' }}>{plan}</strong> chỉ cho phép tạo tối đa <strong style={{ color: '#c4b5fd' }}>{limit} CV</strong>
                    </p>
                </div>

                <div style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {[{ plan: 'PRO', cv: 12, price: '50.000đ/tháng', color: '#7c3aed', icon: Zap },
                          { plan: 'PREMIUM', cv: 20, price: '500.000đ/năm', color: '#d97706', icon: Crown }].map(({ plan: p, cv, price, color, icon: Icon }) => (
                            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: '#fafafa', border: '1px solid #f0f0f0' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={17} color={color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Gói {p}</div>
                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Tạo tối đa {cv} CV · {price}</div>
                                </div>
                                <Sparkles size={14} color={color} />
                            </div>
                        ))}
                    </div>

                    <a
                        href="/nang-cap"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            padding: '13px', width: '100%',
                            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            color: 'white', borderRadius: '12px',
                            fontSize: '14px', fontWeight: '700',
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                            marginBottom: '10px',
                        }}
                    >
                        <Crown size={16} />
                        Nâng cấp ngay
                    </a>
                    <button
                        onClick={onClose}
                        style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', color: '#6b7280', cursor: 'pointer' }}
                    >
                        Để sau
                    </button>
                </div>
            </div>
        </div>
    );
}

const SOURCE_OPTIONS = [
    { key: 'existing', label: 'Nội dung CV đã tạo trước đó', desc: null },
    { key: 'template', label: 'Nội dung CV mẫu gợi ý', desc: null },
    { key: 'blank', label: 'Tạo CV từ đầu', desc: 'Bắt đầu từ một khung CV trắng không có nội dung gợi ý' },
];

function Thumbnail({ Component, color, content }) {
    return (
        <div style={{ width: `${THUMB_W}px`, height: `${THUMB_H}px`, overflow: 'hidden', margin: '0 auto', background: 'white' }}>
            <div style={{ width: `${A4_W}px`, transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none', userSelect: 'none' }}>
                <Component content={content || SAMPLE_CONTENT} color={color} />
            </div>
        </div>
    );
}

function TemplateCard({ tpl, color, onColorChange, onPreview, onUse, creating }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            style={{
                background: 'white', borderRadius: '14px', overflow: 'hidden',
                border: '1px solid #e5e7eb',
                boxShadow: hovered ? '0 12px 36px rgba(0,0,0,0.13)' : '0 2px 6px rgba(0,0,0,0.06)',
                transform: hovered ? 'translateY(-4px)' : 'none',
                transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div
                style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                onClick={() => onPreview(tpl, color)}
            >
                <Thumbnail Component={tpl.Component} color={color} content={tpl.sampleContent} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.38)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.2s',
                }}>
                    <div style={{ background: 'white', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                        <Eye size={14} /> Xem trước
                    </div>
                </div>
            </div>

            <div style={{ padding: '14px 16px 10px' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '3px' }}>{tpl.name}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', minHeight: '36px' }}>{tpl.description}</div>
            </div>

            <div style={{ padding: '0 16px 12px', display: 'flex', gap: '7px' }}>
                {tpl.colors.map((c) => (
                    <button key={c} onClick={() => onColorChange(tpl.id, c)}
                        style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, border: color === c ? '2.5px solid #111827' : '2px solid transparent', outline: color === c ? '2px solid white' : 'none', outlineOffset: '-4px', cursor: 'pointer', transition: 'transform 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    />
                ))}
            </div>

            <div style={{ padding: '0 12px 14px', display: 'flex', gap: '8px' }}>
                <button onClick={() => onPreview(tpl, color)}
                    style={{ flex: 1, padding: '9px 0', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer', fontWeight: '500', transition: 'border-color 0.15s, color 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00b14f'; e.currentTarget.style.color = '#00b14f'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; }}
                >
                    Xem trước
                </button>
                <button onClick={() => onUse(tpl.id, color, 'template', tpl.sampleContent || SAMPLE_CONTENT)} disabled={creating}
                    style={{ flex: 1, padding: '9px 0', border: 'none', background: creating ? '#86efac' : '#00b14f', borderRadius: '8px', fontSize: '13px', color: 'white', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: '600', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { if (!creating) e.currentTarget.style.background = '#009a43'; }}
                    onMouseLeave={(e) => { if (!creating) e.currentTarget.style.background = '#00b14f'; }}
                >
                    Dùng mẫu này
                </button>
            </div>
        </div>
    );
}

function PreviewModal({ tpl, initialColor, creating, onClose, onUse }) {
    const [color, setColor] = useState(initialColor);
    const [source, setSource] = useState('template');
    const [existingList, setExistingList] = useState(null);
    const [existingIndex, setExistingIndex] = useState(0);
    const [loadingExisting, setLoadingExisting] = useState(false);

    const currentExistingContent = useMemo(() => {
        if (!existingList || existingList.length === 0) return null;
        const cv = existingList[existingIndex] || existingList[0];
        if (!cv) return null;
        const personalInfo = cv.personalInfo || {};
        const experiences = cv.experiences || [];
        const education = cv.education || [];
        const skills = cv.skills || [];
        // CV has no meaningful content → return null so preview falls back to sample
        if (!personalInfo.fullName && experiences.length === 0 && education.length === 0 && skills.length === 0) return null;
        return { personalInfo, objective: cv.objective || '', experiences, education, skills, languages: cv.languages || [], certifications: cv.certifications || [], activities: cv.activities || [] };
    }, [existingList, existingIndex]);

    const previewContent = useMemo(() => {
        if (source === 'existing') return currentExistingContent || tpl.sampleContent || SAMPLE_CONTENT;
        return tpl.sampleContent || SAMPLE_CONTENT;
    }, [source, currentExistingContent, tpl]);

    const handleSource = async (key) => {
        setSource(key);
        if (key === 'existing' && existingList === null) {
            setLoadingExisting(true);
            try {
                const res = await resumeService.list();
                const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setExistingList(list);
                setExistingIndex(0);
            } catch {
                setExistingList([]);
            } finally {
                setLoadingExisting(false);
            }
        }
    };

    const handleCreate = () => {
        const contentMap = {
            template: tpl.sampleContent || SAMPLE_CONTENT,
            blank: null,
            existing: currentExistingContent,
        };
        onUse(tpl.id, color, source, contentMap[source]);
    };

    const canCreate = !(source === 'existing' && loadingExisting) && !creating;

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(3px)' }}
            onClick={onClose}
        >
            <div
                style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', width: '100%', maxWidth: '1020px', maxHeight: '93vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 70px rgba(0,0,0,0.35)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Mẫu CV {tpl.name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>{tpl.description}</div>
                    </div>
                    <button onClick={onClose}
                        style={{ width: '32px', height: '32px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
                    {/* CV Preview */}
                    <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '28px 24px' }}>
                        <div style={{ borderRadius: '4px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', flexShrink: 0, width: `${MODAL_W}px` }}>
                            <div style={{ width: `${MODAL_W}px`, height: `${MODAL_H}px`, overflow: 'hidden', background: 'white' }}>
                                <div style={{ width: `${A4_W}px`, minHeight: `${A4_H}px`, background: 'white', transform: `scale(${MODAL_SCALE})`, transformOrigin: 'top left', pointerEvents: 'none', userSelect: 'none' }}>
                                    <tpl.Component content={previewContent} color={color} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right panel */}
                    <div style={{ width: '272px', flexShrink: 0, borderLeft: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                        <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', letterSpacing: '-0.1px' }}>
                                Bạn muốn tạo CV từ?
                            </div>

                            {/* Source options */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {SOURCE_OPTIONS.map(({ key, label, desc }) => {
                                    const active = source === key;
                                    return (
                                        <div
                                            key={key}
                                            onClick={() => handleSource(key)}
                                            style={{
                                                padding: '12px 14px',
                                                borderRadius: '10px',
                                                border: `1.5px solid ${active ? '#0f172a' : '#e2e8f0'}`,
                                                cursor: 'pointer',
                                                background: active ? '#f8fafc' : 'white',
                                                transition: 'border-color 0.15s, background 0.15s',
                                            }}
                                            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#fafafa'; } }}
                                            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; } }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                {/* Custom radio */}
                                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${active ? '#0f172a' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'border-color 0.15s' }}>
                                                    {active && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0f172a' }} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: active ? '600' : '500', color: '#0f172a', lineHeight: '1.4' }}>
                                                        {label}
                                                    </div>
                                                    {desc && (
                                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', lineHeight: '1.5' }}>{desc}</div>
                                                    )}
                                                    {key === 'existing' && active && (
                                                        <div style={{ marginTop: '8px' }}>
                                                            {loadingExisting ? (
                                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Đang tải CV...</div>
                                                            ) : existingList?.length === 0 ? (
                                                                <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '500' }}>Bạn chưa có CV nào. Hãy chọn tuỳ chọn khác.</div>
                                                            ) : existingList?.length === 1 ? (
                                                                <div style={{ fontSize: '11px', color: currentExistingContent ? '#22c55e' : '#94a3b8', fontWeight: '500' }}>
                                                                    {currentExistingContent ? 'Đang xem CV của bạn' : 'CV chưa có nội dung — hiển thị mẫu gợi ý'}
                                                                </div>
                                                            ) : existingList ? (
                                                                <div>
                                                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Chọn CV để xem trước:</div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setExistingIndex(i => Math.max(0, i - 1)); }}
                                                                            disabled={existingIndex === 0}
                                                                            style={{ width: '28px', height: '28px', border: '1px solid #e2e8f0', borderRadius: '6px', background: existingIndex === 0 ? '#f8fafc' : 'white', cursor: existingIndex === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: existingIndex === 0 ? '#cbd5e1' : '#374151', fontSize: '18px', fontWeight: '500', flexShrink: 0, lineHeight: '1' }}
                                                                        >‹</button>
                                                                        <div style={{ flex: 1, textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                                                                            {existingIndex + 1} / {existingList.length}
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setExistingIndex(i => Math.min(existingList.length - 1, i + 1)); }}
                                                                            disabled={existingIndex === existingList.length - 1}
                                                                            style={{ width: '28px', height: '28px', border: '1px solid #e2e8f0', borderRadius: '6px', background: existingIndex === existingList.length - 1 ? '#f8fafc' : 'white', cursor: existingIndex === existingList.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: existingIndex === existingList.length - 1 ? '#cbd5e1' : '#374151', fontSize: '18px', fontWeight: '500', flexShrink: 0, lineHeight: '1' }}
                                                                        >›</button>
                                                                    </div>
                                                                    {!currentExistingContent && (
                                                                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>CV này chưa có nội dung — hiển thị mẫu gợi ý</div>
                                                                    )}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Spacer */}
                            <div style={{ flex: 1 }} />

                            {/* Colors */}
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '20px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '10px' }}>Màu sắc</div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {tpl.colors.map((c) => (
                                        <button key={c} onClick={() => setColor(c)}
                                            style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: color === c ? '3px solid #111827' : '2.5px solid transparent', outline: color === c ? '2px solid white' : 'none', outlineOffset: '-5px', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', transition: 'transform 0.15s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Create button */}
                            <button
                                onClick={handleCreate}
                                disabled={!canCreate}
                                style={{ marginTop: '14px', padding: '13px', background: canCreate ? '#00b14f' : '#86efac', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: canCreate ? 'pointer' : 'not-allowed', transition: 'background 0.15s', width: '100%' }}
                                onMouseEnter={(e) => { if (canCreate) e.currentTarget.style.background = '#009a43'; }}
                                onMouseLeave={(e) => { if (canCreate) e.currentTarget.style.background = '#00b14f'; }}
                            >
                                {creating ? 'Đang tạo...' : 'Tạo CV'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TaoCvPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, user } = useAuthStore();
    const linhvuc = searchParams.get('linhvuc');
    const style = searchParams.get('style');
    const urlFilter = linhvuc ? (LINHVUC_MAP[linhvuc] || null) : style ? (STYLE_MAP[style] || null) : null;
    const [localFilter, setLocalFilter] = useState('Tất cả');
    const activeFilter = urlFilter || localFilter;

    const [selectedColors, setSelectedColors] = useState(Object.fromEntries(TEMPLATES.map((t) => [t.id, t.colors[0]])));
    const [creating, setCreating] = useState(false);
    const [preview, setPreview] = useState(null);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [cvCount, setCvCount] = useState(null); // null = loading

    // Plan limit
    const plan = user?.plan || 'FREE';
    const cvLimit = PLAN_LIMITS_CV[plan] ?? 6;
    const isFull = cvCount !== null && cvCount >= cvLimit;

    useEffect(() => {
        if (!isAuthenticated) return;
        resumeService.list('resume')
            .then((res) => {
                const list = res.data?.data || res.data || [];
                setCvCount(Array.isArray(list) ? list.length : 0);
            })
            .catch(() => setCvCount(0));
    }, [isAuthenticated]);

    const handleColorChange = (id, color) => setSelectedColors((prev) => ({ ...prev, [id]: color }));

    const handleUseTemplate = async (templateId, color, source, contentData) => {
        if (!isAuthenticated) { router.push('/login'); return; }

        // ── Check limit trước khi tạo ──
        if (isFull) {
            setPreview(null);
            setShowLimitModal(true);
            return;
        }

        setCreating(true);
        try {
            const res = await resumeService.create({ type: 'resume', template: templateId, color });
            const resumeId = res.data.id;
            if (contentData && (source === 'template' || source === 'existing')) {
                try {
                    await resumeService.update(resumeId, {
                        personalInfo: contentData.personalInfo,
                        objective: contentData.objective,
                        experiences: contentData.experiences,
                        education: contentData.education,
                        skills: contentData.skills,
                        languages: contentData.languages,
                        certifications: contentData.certifications,
                        activities: contentData.activities,
                    });
                } catch { /* non-critical: navigate anyway */ }
            }
            setCvCount((c) => (c ?? 0) + 1);
            router.push(`/tao-cv/${resumeId}`);
        } catch {
            setCreating(false);
        }
    };

    const filtered = TEMPLATES.filter((tpl) => activeFilter === 'Tất cả' || tpl.tags.includes(activeFilter));

    return (
        <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>
            {/* Limit modal */}
            {showLimitModal && (
                <LimitModal plan={plan} limit={cvLimit} onClose={() => setShowLimitModal(false)} />
            )}

            {/* Hero */}
            <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 20px 36px', display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f0fdf4', color: '#15803d', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>
                                {TEMPLATES.length} mẫu CV chuyên nghiệp
                            </span>
                            {cvCount !== null && (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                    background: isFull ? '#fef2f2' : '#f0f9ff',
                                    color: isFull ? '#dc2626' : '#0284c7',
                                    fontSize: '12px', fontWeight: '700',
                                    padding: '4px 12px', borderRadius: '20px',
                                    border: `1px solid ${isFull ? '#fecaca' : '#bae6fd'}`,
                                }}>
                                    {isFull
                                        ? `⚠ Đã dùng ${cvCount}/${cvLimit} CV — `
                                        : `📄 ${cvCount}/${cvLimit} CV đã tạo · `}
                                    <a href="/nang-cap" style={{ color: isFull ? '#dc2626' : '#0284c7', textDecoration: 'underline' }}>
                                        {isFull ? 'Nâng cấp' : 'Nâng cấp'}
                                    </a>
                                </span>
                            )}
                        </div>
                        <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: '800', color: '#0f172a', lineHeight: '1.2', marginBottom: '12px' }}>
                            Mẫu CV xin việc tiếng Việt chuẩn 2026
                        </h1>
                        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.7', maxWidth: '480px' }}>
                            Tuyển chọn mẫu CV đa dạng phong cách, thiết kế đẹp và chuyên nghiệp — giúp bạn gây ấn tượng với nhà tuyển dụng ngay từ cái nhìn đầu tiên.
                        </p>
                    </div>
                    <div className="hidden sm:block" style={{ flexShrink: 0 }}>
                        <Image src={robo} alt="" width={190} height={190} style={{ objectFit: 'contain' }} />
                    </div>
                </div>
            </div>

            {/* Sticky filter tabs */}
            <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 20px', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                        {FILTER_TAGS.map((tag) => {
                            const active = activeFilter === tag;
                            return (
                                <button key={tag}
                                    onClick={() => { setLocalFilter(tag); if (urlFilter && tag !== urlFilter) router.replace('/tao-cv', { scroll: false }); }}
                                    style={{ padding: '14px 18px', border: 'none', borderBottom: active ? '3px solid #00b14f' : '3px solid transparent', background: 'transparent', color: active ? '#00b14f' : '#6b7280', fontSize: '13px', fontWeight: active ? '700' : '500', cursor: 'pointer', flexShrink: 0, transition: 'color 0.15s, border-color 0.15s' }}
                                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#374151'; }}
                                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#6b7280'; }}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '32px 20px 64px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                    {filtered.map((tpl) => (
                        <TemplateCard
                            key={tpl.id}
                            tpl={tpl}
                            color={selectedColors[tpl.id]}
                            onColorChange={handleColorChange}
                            onPreview={(t, c) => setPreview({ tpl: t, color: c })}
                            onUse={handleUseTemplate}
                            creating={creating}
                        />
                    ))}
                </div>
            </div>

            {/* Modal */}
            {preview && (
                <PreviewModal
                    tpl={preview.tpl}
                    initialColor={preview.color}
                    creating={creating}
                    onClose={() => setPreview(null)}
                    onUse={handleUseTemplate}
                />
            )}
        </div>
    );
}
