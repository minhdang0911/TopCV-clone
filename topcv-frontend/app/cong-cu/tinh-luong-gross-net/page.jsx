'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import bannerImg from '@/app/assests/img/banner-gross-net.webp';
import MinWageModal from '@/app/components/tools/MinWageModal';

const PERIODS = [
    {
        id: 'nd293',
        label: 'Từ 01/01/2026 (Mới nhất)',
        badge: 'Mới nhất',
        personalDeduction: 15_500_000,
        dependantDeduction: 6_200_000,
        minWage: { I: 5_310_000, II: 4_730_000, III: 4_140_000, IV: 3_700_000 },
        minWageDate: '01/01/2026',
        minWageDecree: 'NĐ 293/2025/NĐ-CP',
    },
    {
        id: 'nd73',
        label: 'Từ 01/07/2024 - 31/12/2025',
        badge: null,
        personalDeduction: 11_000_000,
        dependantDeduction: 4_400_000,
        minWage: { I: 4_960_000, II: 4_410_000, III: 3_860_000, IV: 3_450_000 },
        minWageDate: '01/07/2024',
        minWageDecree: 'NĐ 73/2024/NĐ-CP',
    },
];

const BRACKETS = [
    { from: 0,      to: 5e6,      rate: 0.05 },
    { from: 5e6,    to: 10e6,     rate: 0.10 },
    { from: 10e6,   to: 18e6,     rate: 0.15 },
    { from: 18e6,   to: 32e6,     rate: 0.20 },
    { from: 32e6,   to: 52e6,     rate: 0.25 },
    { from: 52e6,   to: 80e6,     rate: 0.30 },
    { from: 80e6,   to: Infinity, rate: 0.35 },
];
const BRACKET_LABELS = [
    'Đến 5 triệu VND','Trên 5 triệu đến 10 triệu VND','Trên 10 triệu đến 18 triệu VND',
    'Trên 18 triệu đến 32 triệu VND','Trên 32 triệu đến 52 triệu VND',
    'Trên 52 triệu đến 80 triệu VND','Trên 80 triệu VND',
];

function calcTax(t) {
    if (t <= 0) return 0;
    let tax = 0;
    for (const { from, to, rate } of BRACKETS) {
        if (t <= from) break;
        tax += (Math.min(t, to === Infinity ? t : to) - from) * rate;
    }
    return Math.round(tax);
}
function calcGrossToNet(gross, dependants, period) {
    const bhXH = Math.round(gross * 0.08);
    const bhYT = Math.round(gross * 0.015);
    const bhTN = Math.round(gross * 0.01);
    const totalBH = bhXH + bhYT + bhTN;
    const incomeBeforeTax = gross - totalBH;
    const rawTaxable = incomeBeforeTax - period.personalDeduction - dependants * period.dependantDeduction;
    const taxableIncome = Math.max(0, rawTaxable);
    const tax = calcTax(taxableIncome);
    const net = incomeBeforeTax - tax;
    const employerBH = Math.round(gross * 0.215);
    return { gross, net, bhXH, bhYT, bhTN, totalBH, incomeBeforeTax, taxableIncome, tax, employerBH };
}
function calcNetToGross(targetNet, dependants, period) {
    let lo = targetNet * 0.8, hi = targetNet * 3;
    for (let i = 0; i < 80; i++) {
        const mid = Math.round((lo + hi) / 2);
        const { net } = calcGrossToNet(mid, dependants, period);
        if (Math.abs(net - targetNet) < 1) { lo = hi = mid; break; }
        if (net < targetNet) lo = mid; else hi = mid;
    }
    return calcGrossToNet(Math.round((lo + hi) / 2), dependants, period);
}
function fmt(n) { return Math.round(n).toLocaleString('vi-VN'); }
function parseInput(s) { return parseFloat((s || '').replace(/\./g, '').replace(/,/g, '.')) || 0; }
function formatInput(val) {
    const num = val.replace(/[^0-9]/g, '');
    return num ? Number(num).toLocaleString('vi-VN') : '';
}
function getBracketRows(taxableIncome) {
    return BRACKETS.map(({ from, to, rate }, i) => {
        const chiu = Math.max(0, Math.min(taxableIncome, to === Infinity ? taxableIncome : to) - from);
        return { label: BRACKET_LABELS[i], rate: `${rate * 100}%`, chiu, tien: Math.round(chiu * rate) };
    });
}

const PROVINCES_ND293 = [
    { name: '1. Thành phố Hà Nội', detail: 'Vùng I: gồm các phường Hoàn Kiếm, Ba Đình, Ngọc Hà, Giảng Võ, Hồ Tây, Liên Mạc, Ô Chợ Dừa, Hàng Ngã, Linh Nam, Vĩnh Hưng, Tương Mai, Đình Công, Hoàng Liệt, Yên Sở, Thanh Xuân, Khương Đình, Phương Liệt, Cầu Giấy, Nghĩa Đô, Yên Hoa, Tứ Liên, Thụy Khuê, Xuân Đỉnh, Đông Ngạc, Từ Liêm, Xuân Phương, Tây Mỗ, Long Biên, Bồ Đề, Việt Hưng, Phúc Lợi, Hà Đông, Dương Nội, Yên Nghĩa, Phú Lương, Kiến Hưng, Thanh Liệt, Chương Mỹ, Sơn Tây, Tùng Thiện, Tây Tựu, Phú Diễn, Thượng Phúc, Thường Tín, Hồng Vân, Phú Xuyên, Thanh Oai, Bình Minh, Tam Hưng, Phú Nghĩa, Xuân Mai, Trần Phú, Hòa Phú, Quảng Bị, Yên Bài, Thạch Thất, Hoài Đức, Vân Canh, Song Phương, An Khánh, Gia Lâm, Thuận An, Bát Tràng, Phù Đổng, Đông Anh, Phú Thịnh, Thiên Lộc, Vĩnh Thanh, Mê Linh, Tráng Việt, Yên Lãng, Tiến Thắng, Quang Minh, Sóc Sơn, Đa Phúc, Nội Bài, Trung Giã, Kim Anh, Ô Diên, Vinh Liêm, Liên Minh.\nVùng II: gồm các xã, phường còn lại.' },
    { name: '2. Tỉnh Cao Bằng', detail: 'Vùng III: gồm các phường Thúc Phán, Nùng Trí Cao, Tân Giang.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '3. Tỉnh Tuyên Quang', detail: 'Vùng III: gồm các phường Mỵ Lâm, Minh Xuân, Nông Tiến, An Tường, Bình Thuận, Hà Giang 1, Hà Giang 2 và xã Ngọc Đường.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '4. Tỉnh Điện Biên', detail: 'Vùng III: gồm các phường Điện Biên Phủ, Mường Thanh và xã Mường Phăng, Nà Tấu.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '5. Tỉnh Lai Châu', detail: 'Vùng III: gồm các phường Tân Phong, Đoàn Kết.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '6. Tỉnh Sơn La', detail: 'Vùng III: gồm các phường Tô Hiệu, Chiềng An, Chiềng Cơi, Chiềng Sinh.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '7. Tỉnh Lào Cai', detail: 'Vùng II: gồm các phường Cam Đường, Lào Cai và các xã Cốc San, Hợp Thành, Gia Phú.\nVùng III: gồm các phường Văn Phú, Yên Bái, Nam Cường, Âu Lâu, Sa Pa và các xã Phong Hải, Xuân Quang, Bảo Thắng, Tằng Loỏng, Mường Bo, Bản Hồ, Tả Phìn, Tả Van, Ngũ Chỉ Sơn.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '8. Tỉnh Thái Nguyên', detail: 'Vùng II: gồm các phường Phan Đình Phùng, Linh Sơn, Tích Lương, Gia Sàng, Quyết Thắng, Quan Triều, Phố Yên, Vạn Xuân, Trung Thành, Phúc Thuận, Sông Công, Bá Xuyên, Bách Quang và các xã Tân Cương, Đại Phúc, Thành Công.\nVùng III: gồm các phường Đức Xuân, Bắc Kạn và các xã Đại Từ, Đức Lương, Phú Thịnh, La Bằng, Phú Lạc, An Khánh, Quân Chu, Vạn Phú, Phú Bình, Đồng Hỷ, Quang Sơn, Trại Cau, Nam Hòa, Văn Hán, Văn Lăng, Phú Lương, Võ Tranh, Yên Trạch, Hợp Thành, Phong Quang.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '9. Tỉnh Lạng Sơn', detail: 'Vùng III: gồm các phường Tam Thanh, Lương Văn Trị, Kỳ Lừa, Đông Kinh.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '10. Tỉnh Quảng Ninh', detail: 'Vùng I: gồm các phường An Sinh, Đồng Triều, Bình Khê, Mạo Khê, Hoàng Quế, Yên Tử, Vàng Danh, Uông Bí, Đông Mai, Hiệp Hòa, Quảng Yên, Hà An, Phong Cốc, Liên Hòa, Tuần Châu, Việt Hưng, Bãi Cháy, Hà Tu, Hà Lầm, Cao Xanh, Hồng Gai, Hạ Long, Hoành Bồ, Mộng Cái 1, Mộng Cái 2, Mộng Cái 3 và các xã Quảng La, Thống Nhất, Hải Sơn, Hải Ninh, Vĩnh Thực.\nVùng II: gồm các phường Mộng Dương, Quang Hanh, Cẩm Phả, Cửa Ông và xã Hải Hòa.\nVùng III: gồm các xã Tiên Yên, Điền Xá, Đồng Ngũ, Hải Lạng, Quảng Tân, Đầm Hà, Quảng Hà, Đường Hoa, Quảng Đức, Cái Chiên và đặc khu Vân Đồn.\nVùng IV: gồm các xã, phường và đặc khu còn lại.' },
    { name: '11. Tỉnh Bắc Ninh', detail: 'Vùng II: gồm nhiều phường Kinh Bắc, Thuận Thành, Quế Võ, Yên Phong, Tiền Du và các xã lân cận.\nVùng III: gồm các xã Lạng Giang, Mỹ Thái, Kép, Tân Dĩnh, Tiến Lực, Tân Yên, Ngọc Thiện, Nhã Nam, Phúc Hòa, Quang Trung, Hợp Thịnh, Hiệp Hòa, Hoàng Vân, Xuân Cẩm.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '12. Tỉnh Phú Thọ', detail: 'Vùng II: gồm các phường Việt Trì, Nông Trang, Thanh Miếu, Văn Phú, Vĩnh Phúc, Vĩnh Yên, Phúc Yên, Xuân Hòa, Hòa Bình, Kỳ Sơn, Tần Hòa, Thống Nhất và các xã Hy Cương, Yên Lạc, Tề Lỗ, Liên Châu, Bình Xuyên, Lương Sơn, Cao Đường, Liễn Sơn, Thịnh Minh.\nVùng III: gồm các phường Phong Châu, Phú Thọ, Âu Cơ và các xã Lâm Thao, Xuân Lũng, Phụng Nguyên, Phù Ninh, Thanh Ba, Đồng Thịnh và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '13. Thành phố Hải Phòng', detail: 'Vùng I: gồm các phường Thủy Nguyên, Thiên Hương, Hòa Bình, Nam Triệu, Bạch Đằng, Lưu Kiếm, Lê Ích Mộc, Hồng Bảng, Hồng An, Ngô Quyền, Gia Viên, Lê Chân, An Biên, Hải An, Đồng Hải, Kiến An, Nam Đố, Đồ Sơn, Hưng Đạo, Dương Kinh, An Dương, An Hải, An Phong, Việt Hòa, Thành Đông, Nam Đồng, Tân Hưng, Thạch Khôi, Tứ Minh, Ái Quốc, Chí Linh, Trần Hưng Đạo, Nguyễn Trãi, Trần Nhân Tông, Lê Đại Hành, Kinh Môn, Nguyễn Đại Năng, Trần Liễu, Bắc An Phú và nhiều xã khác.\nVùng II: gồm các xã Thanh Hà, Hà Tây, Hà Bắc, Hà Nam, Hà Đông, Ninh Giang, Vĩnh Lại, Khúc Thừa Dụ, Tân An, Hồng Châu, Thanh Miện, Hải Hưng và đặc khu Bạch Long Vĩ.\nVùng III: gồm các xã, phường còn lại.' },
    { name: '14. Tỉnh Hưng Yên', detail: 'Vùng II: gồm các phường Phố Hiến, Sơn Nam, Hồng Châu, Mỹ Hào, Đường Hào, Thượng Hồng, Thái Bình, Trần Lâm, Trần Hưng Đạo, Trà Lý, Vũ Phúc và các xã Tân Hưng, Yên Mỹ, Việt Yên, Hoàn Long, Như Quỳnh, Lạc Đạo, Đại Đồng, Nghĩa Trụ, Phụng Công, Văn Giang, Mễ Sở.\nVùng III: gồm các xã Hoàng Hoa Thám, Tiền Lữ, Tiên Hoa, Quang Hưng, Đoàn Đào, Tiến Thắng, Tống Trân, Lương Bằng, Nghĩa Dân, Hiệp Cường, Đức Hợp, Ân Thi và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '15. Tỉnh Ninh Bình', detail: 'Vùng II: gồm các phường Tây Hoa Lư, Hoa Lư, Nam Hoa Lư, Đông Hoa Lư, Nam Định, Thiên Trường, Đông A, Vị Khê, Thành Nam, Trường Thi, Hồng Quang, Mỹ Lộc.\nVùng III: gồm các phường Tam Điệp, Yên Sơn, Trung Sơn, Yên Thắng và nhiều xã thuộc Ninh Bình, Nam Định, Hà Nam.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '16. Tỉnh Thanh Hóa', detail: 'Vùng II: gồm các phường Hạc Thành, Quảng Phú, Đông Quang, Đông Sơn, Đông Tiến, Hàm Rồng, Nguyệt Viên, Sầm Sơn, Nam Sầm Sơn, Bỉm Sơn, Quảng Trung, Ngọc Sơn, Tân Đàn, Hải Linh và nhiều xã lân cận.\nVùng III: gồm các xã Hà Trung, Tống Sơn, Hà Long, Hoạt Giang, Linh Toại, Triệu Lộc, Đồng Thành, Hậu Lộc, Hoa Lộc, Ngư Lộc, Nga Sơn, Nga Thắng, Hổ Vường, Tân Tiến, Nga An, Ba Đình và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '17. Tỉnh Nghệ An', detail: 'Vùng II: gồm các phường Trường Vinh, Thành Vinh, Vinh Hưng, Vinh Phú, Vinh Lộc, Cửa Lò và các xã Hưng Nguyên, Yên Trung, Hưng Nguyên Nam, Lam Thành, Nghi Lộc, Phúc Lộc, Trung Lộc, Thần Linh, Hải Lộc, Văn Kiều.\nVùng III: gồm các phường Hoàng Mai, Tân Mai, Quỳnh Mai, Thái Hòa, Tây Hiếu và các xã Diễn Châu, Quảng Châu, Hà Châu, Tân Châu, An Châu, Minh Châu, Hưng Châu, Đô Lương, Bạch Ngọc, Văn Hiến, Bạch Hà, Thuận Trạng, Lương Sơn, Vạn An, Nam Đàn, Đại Huệ, Thiên Nhẫn, Kim Liên, Nghĩa Đàn, Nghĩa Thọ, Nghi Làm, Nghĩa Mỹ, Nghĩa Hưng, Nghĩa Khánh, Nghĩa Lộc và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '18. Tỉnh Hà Tĩnh', detail: 'Vùng III: gồm các phường Sông Trì, Hải Ninh, Hoành Sơn, Vũng Áng, Thành Sen, Trần Phú, Hà Huy Tập và các xã Thạch Lạc, Đồng Tiến, Thạch Khê, Cẩm Bình, Kỳ Hoa.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '19. Tỉnh Quảng Trị', detail: 'Vùng II: gồm các phường Đồng Hới, Đồng Thuận, Đồng Sơn.\nVùng III: gồm các phường Đồng Hà, Nam Đồng Hà, Ba Đồn, Bắc Gianh và các xã Nam Gianh, Nam Ba Đồn, Tân Gianh, Trung Thuận, Quảng Trạch, Hòa Trạch, Phú Trạch, Thượng Trạch, Phong Nha, Bắc Trạch, Đồng Trạch, Hoàn Lão, Bồ Trạch, Nam Trạch, Quảng Ninh, Ninh Châu, Trường Ninh, Trường Sơn, Lệ Thủy, Cam Hồng, Sen Ngũ, Tân Mỹ, Trường Phú, Lệ Ninh, Đồng Lê, Vinh Linh, La Tử Vùng, Bến Quan, Của Việt, Gio Linh, Cam Lộ, Hải Lăng, Sao Lao, Phong, Hướng Phiên, Diên Sanh.\nVùng IV: gồm các xã, phường và đặc khu còn lại.' },
    { name: '20. Thành phố Huế', detail: 'Vùng II: gồm các phường Thuận An, Hóa Châu, Mỹ Thượng, Vỹ Dạ, Thuận Hóa, An Cựu, Thủy Xuân, Kim Long, Hương An, Phú Xuân, Dương Nổ.\nVùng III: gồm các phường Phong Điền, Phong Thái, Phong Định, Phong Phú, Phong Quảng, Hương Trà, Kim Trà, Hương Thủy, Phú Bài, Thanh Thủy và các xã Điền Biên, Quảng Biên, Bình Điền, Phú Vinh, Phú Hồ, Phú Vang, Vinh Lộc, Hưng Lộc, Lộc An, Phú Lộc, Chân Mây - Lăng Cô, Long Quảng, Nam Đông, Khe Tre.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '21. Thành phố Đà Nẵng', detail: 'Vùng I: gồm các phường Hải Châu, Hòa Cường, Thanh Khê, An Khê, An Hải, Sơn Trà, Ngũ Hành Sơn, Hòa Khánh, Hải Vân, Liên Chiểu, Cẩm Lệ, Hòa Xuân, Tam Kỳ, Quảng Phú, Hương Trà, Bàn Thạch, Hội An, Hội An Đông, Hội An Tây và các xã Hòa Vang, Hòa Tiến, Bà Nà, Tân Hiệp và đặc khu Hoàng Sa.\nVùng II: gồm các phường Điện Bàn, Điện Bàn Đông, An Thắng, Điện Bàn Bắc và các xã Núi Thành, Tam Mỹ, Tam Anh, Đức Phú, Tam Xuân, Tam Hải, Tây Hồ, Chiên Đàn, Phú Ninh, Nhơn Bình, Thắng, Thành Phố, Đồng Dương, Quế Sơn Trung, Quế Sơn, Xuân Phú, Nông Sơn, Quế Phước, Duy Nghĩa, Nam Phước, Duy Xuyên, Thu Bồn, Điện Bàn Tây, Gò Nổi, Đại Lộc, Hà Nha, Thướng Đức, Vũ Gia, Phú Thuận.\nVùng III: gồm các xã, phường còn lại.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '22. Tỉnh Quảng Ngãi', detail: 'Vùng III: gồm các phường Trương Quang Trọng, Cẩm Thành, Nghĩa Lộ, Kon Tum, Đắk Cấm, Đắk Bla và các xã Tịnh Khê, An Phú, Bình Minh, Bình Chướng, Bình Sơn, Vạn Tường, Đồng Sơn, Trường Giang, Ba Gia, Sơn Tịnh, Thọ Phong, Ngok Bay, la Chim, Đắk Rơ Wa, Đắk Pxi, Đắk Mar, Đắk Ui, Đắk Hà, Ngọc Réo.\nVùng IV: gồm các xã, phường và đặc khu còn lại.' },
    { name: '23. Tỉnh Gia Lai', detail: 'Vùng III: gồm các phường Quy Nhơn, Quy Nhơn Đông, Quy Nhơn Tây, Quy Nhơn Nam, Quy Nhơn Bắc, Pleiku, Hội Phú, Thống Nhất, Diên Hồng, An Phú và các xã Biển Hồ, Gào.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '24. Tỉnh Khánh Hòa', detail: 'Vùng II: gồm các phường Nha Trang, Bắc Nha Trang, Tây Nha Trang, Nam Nha Trang, Bắc Cam Ranh, Cam Ranh, Cam Linh, Bà Ngòi, Ninh Hòa, Đồng Ninh Hòa, Hòa Thắng, Phan Rang, Đồng Hải, Ninh Chữ, Bảo An, Đô Vĩnh và các xã Nam Cam Ranh, Bắc Ninh Hòa, Tân Đinh, Nạm Đinh, Tây Ninh Hòa, Tây Tuy Hòa, Bắc Tuy Hòa, Ninh Sơn.\nVùng III: gồm các xã Đại Lãnh, Tu Bông, Vạn Thắng, Vạn Ninh, Vạn Hưng, Diên Khánh, Diên Lạc, Diên Điền, Diên Thọ, Diên Lâm, Cam Lâm, Suối Dầu, Cam Hiệp, Cam An, Ninh Phước, Phước Hậu, Phước Định, Ninh Hải, Xuân Hải, Vĩnh Hải, Thuận Bắc, Công Hải.\nVùng IV: gồm các xã, phường và đặc khu còn lại.' },
    { name: '25. Tỉnh Đắk Lắk', detail: 'Vùng III: gồm các phường Buôn Ma Thuột, Tân An, Tân Lập, Nguyễn Đại, Sông Cầu, Thống Nhất, Ea Kao, Tuy Hòa, Phú Yên, Bình Kiến, Đồng Hòa, Hòa Hiệp và các xã Hòa Phú, Xuân Thọ, Xuân Cảnh, Xuân Lộc, Hòa Xuân.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '26. Tỉnh Lâm Đồng', detail: "Vùng II: gồm các phường Xuân Hương - Đà Lạt, Cam Ly - Đà Lạt, Làm Viên - Đà Lạt, Xuân Trường - Đà Lạt, Lang Biang - Đà Lạt, 1 Bảo Lộc, 2 Bảo Lộc, 3 Bảo Lộc, B' Lao, Hàm Thắng, Bình Thuận, Mũi Né, Phú Thủy, Phan Thiết, Tiến Thành, Tân Xuân và xã Tuyên Quang.\nVùng III: gồm các phường La Gi, Phước Hội, Bắc Gia Nghĩa, Nam Gia Nghĩa, Đồng Gia Nghĩa và các xã Hiệp Thạnh, Đức Trọng, Tà Hine, Tà Năng, Liên Nghĩa, Đinh Văn Lâm Hà, Di Linh, Hòa Ninh, Hòa Bắc, Bình Trang, Giữ Thăng, Bảo Thuận, Sơn Điền, Gia Hiệp, Sơn Hải, Đồng Giang, La Đạ, Hàm Thuận Bắc, Hàm Thuận Nam, Hồng Sơn, Hàm Liêm, Hàm Thanh, Hàm Kiệm, Tân Thành, Hàm Thuận Nam, Tân Lập, Ninh Gia.\nVùng IV: gồm các xã, phường còn lại." },
    { name: '27. Tỉnh Đồng Nai', detail: 'Vùng I: gồm các phường Biên Hòa, Trản Biên, Tam Hiệp, Long Bình, Tràng Dài, Hố Nai, Long Hưng, Bình Lộc, Bảo Vinh, Xuân Lập, Long Khánh, Hàng Gòn, Tần Triều, Phước Tân, Tam Phước, Phú Lý và các Đại Phước, Nhơn Trạch, Phước An, Phước Thái, Long Phước, Bình An, Long Thành, An Phước, An Viễn, Bình Minh, Bình Nhật, Tràng Bôm, Bầu Hàm, Hưng Thịnh, Đầu Giây, Gia Kiệm, Thống Nhất, Xuân Đường, Xuân Đông, Xuân Định, Xuân Phú, Xuân Lộc, Xuân Hòa, Xuân Thành, Xuân Bắc, Trị An, Tân An, Phú Lý.\nVùng II: gồm các phường Minh Hưng, Chơn Thành, Đồng Xoài, Bình Phước và các xã Xuân Quế, Cầm Mỹ, Sông Ray, La Ngã, Bình Quân, Phú Vinh, Phú Hòa, Ta Lai, Nam Cát Tiên, Tân Phú, Phú Lâm, Nha Bích, Tân Quan, Thuận Lợi, Đồng Tâm, Tân Lợi, Đồng Phú, Đắk Lua, Thanh Sơn.\nVùng III: gồm các phường Thiên Hưng, Hưng Phước, Phú Nghĩa, Đa Kia, Phước Sơn, Nghĩa Trung, Bù Đăng, Thọ Sơn, Đắk Nhau, Bom Bo, Bù Gia Mập, Đắk Ơ.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '28. Thành phố Hồ Chí Minh', detail: 'Vùng I: gồm các phường Sài Gòn, Tân Định, Bến Thành, Cầu Ông Lãnh, Bàn Cờ, Xuân Hòa, Nhiều Lộc, Xóm Chiếu, Khánh Hội, Vĩnh Hội, Chợ Quán, An Đông, Chợ Lớn, Bình Tây, Bình Phú, Bình Lâm, Tân Thuận, Phú Thuận, Tân Mỹ, Tân Hưng, Chính, Tân Kim, Tân Trường, Bình Tân, Chương Dương, Bình Lợi Trung, Thanh Mỹ Tây, Bình Quới, Hạnh Thông, An Nhơn, Gò Vấp, An Hội Đông, Thông Tây Hội, An Hội Tây, Đức Nhuận, Cầu Kinh, Hiệp Bình, Phú Trung, Hiệp Bình Chánh, Thủ Đức, Tam Bình, Linh Xuân, Tăng Nhơn Phú, Long Bình, Phước Long, Trường Thọ, Cát Lái, Bình An, Thành phố Thủ Dầu Một, Phú An, Định Hòa, Tân An, Chánh Phú Hòa, Vĩnh Tân, Tân Bình, Cổ, An Điền, Bến Cát, Bình Mỹ, Đồng Thanh, Hóc Môn, Xuân Thới Sơn, Ba Điểm, Nhà Bè, Hiệp Phước, Thương Tân, Bắc Tân Uyên, Phú Hòa Đông, Thôn Long, Thủ Thừa, Mỹ Bình và các xã khác thuộc vùng I.\nVùng II: gồm các phường Bà Rịa, Long Hương, Tam Long và các xã Bình Khánh, An Thời Đông, Cần Giờ, Thạnh An; các xã Kim Long, Châu Đức, Ngãi Giao, Nghĩa Thành, Long Hải, Long Điền và đặc khu Côn Đảo.\nVùng III: gồm các xã, phường và đặc khu còn lại.' },
    { name: '29. Tỉnh Tây Ninh', detail: 'Vùng I: gồm các phường Long An, Tân An, Khánh Hậu và các xã An Ninh, Hiệp Hòa, Hậu Nghĩa, Hòa Khánh, Đức Lập, Mỹ Hạnh, Đức Hòa, Thạnh Lợi, Bình Đức, Lương Bến Lức, Mỹ Yên, Phước Lý, Mỹ Lộc, Cần Giuộc, Phước Vĩnh Tây, Tân Tập.\nVùng II: gồm các phường Kiến Tường, Tân Ninh, Bình Minh, Ninh Thạnh, Long Hoa, Hòa Thành, Thanh Điền, Tráng Bàng, An Tinh, Gò Dầu, Gia Lộc và các xã Tuyên Thạnh, Bình Hiệp, Thủ Thừa, Mỹ An, Mỹ Thạnh, Tân Long, Long Cang, Rạch Kiến, Mỹ Lệ, Tân Lân, Cẩn Đước, Long Hựu, Hưng Thuận, Phước Chi, Thanh Đức, Phước Thạnh, Trường Mít, Nhựt Tảo.\nVùng III: gồm các xã Bình Thành, Thanh Phước, Thanh Hòa, Tân Tây, Mỹ Quý, Đồng Thành, Đức Huệ, Vàm Cỏ, Tân Trụ, Thuận Mỹ, An Lục Long, Tầm Vu, Vĩnh Công, Lộc Ninh, Cầu Khởi, Dương Minh Châu, Tân Đông, Tân Châu, Tân Hòa, Tân Lập, Tân Biên, Thanh Bình, Trà Vong, Phước Vinh, Hòa Hội, Ninh Điền, Châu Thành, Hảo Đước, Long Chữ, Long Thuận, Bến Câu.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '30. Tỉnh Đồng Tháp', detail: 'Vùng II: gồm các phường Mỹ Tho, Đạo Thanh, Mỹ Phong, Thới Sơn, Trung An và các xã Tân Hương, Châu Thành, Long Hưng, Long Định, Vĩnh Kim, Kim Sơn, Bình Trưng.\nVùng III: gồm các phường Gò Công, Long Thuận, Son Qui, Bình Xuân, Mỹ Phước Tây, Thanh Hòa, Cai Lậy, Nhị Quý, An Bình, Hồng Ngự, Thường Lạc, Cao Lãnh, Mỹ Ngãi, Mỹ Trà, Sa Đéc và các xã Tân Phú 1, Tân Phú 2, Tân Phú 3, Hưng Thạnh, Mỹ Tịnh An, Lương Hòa Lạc, Tân Thuận Bình, Chợ Gạo, An Thạnh Thủy, Bình Ninh, Tân Dương.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '31. Tỉnh Vĩnh Long', detail: 'Vùng II: gồm các phường Thanh Đức, Long Châu, Phước Hậu, Tân Hạnh, Tân Ngãi, Bình Minh, Cái Vồn, Đồng Thành, An Hội, Phú Khương, Bến Tre, Sơn Đông, Phú Tân, Long Đức, Trà Vinh, Nguyệt Hóa, Hoa Thuận và các xã Phú Túc, Giao Long, Tiền Thủy, Tân Phú.\nVùng III: gồm các phường Duyên Hải, Trường Long Hòa và các xã Cái Nhum, Tân Long Hội, Nhơn Phú, Bình Phước, An Bình, Long Hồ, Phú Quới, Đồng Khởi, Mỏ Cày, Thành Thới, An Định, Hương Mỹ Trị, Bảo Thạnh, Ba Tri, Tân Xuân, Mỹ Thạnh Hòa, Ca An Ngãi Trung, An Hiệp, Thới Thuận, Thanh Phước, Bình Đại, Thanh Trị, Lộc Thuận, Châu Hưng, Phú Thuận, Long Hậu, Hưng Nhượng.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '32. Tỉnh An Giang', detail: 'Vùng II: gồm các phường Long Xuyên, Bình Đức, Mỹ Thới, Châu Đốc, Vĩnh Tế, Vĩnh Thông, Rạch Giá, Hà Tiên, Tô Châu; các xã Mỹ Hòa Hưng, Tiền Hải và các đặc khu Phú Quốc, Thổ Châu.\nVùng III: gồm các phường Tân Châu, Long Phú; các xã Tân An, Châu Phong, Vĩnh Xương, Châu Phú, Mỹ Đức, Vĩnh Thạnh Trung, Bình Mỹ, Thạnh Mỹ Tây, An Châu, Bình Hòa, Cẩn Đăng, Vĩnh Hanh, Vĩnh An, Thoại Sơn, Ốc Eo, Định Mỹ, Phú Hòa, Vĩnh Trạch, Tây Phú, Thạnh Lộc, Châu Thành, Bình An, Hòa Điền, Kiên Lương, Sơn Hải, Hòn Nghệ và đặc khu Kiên Hải.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '33. Thành phố Cần Thơ', detail: 'Vùng II: gồm các phường Phú Lợi, Mỹ Xuyên, Ninh Kiều, Cái Khế, Tân An, An Bình, Thới An Đông, Bình Thủy, Long Tuyến, Cái Răng, Hưng Phú, Ô Môn, Thới Long, Phước Thới, Trung Nhứt, Thốt Nốt, Thuận Hưng, Tân Lộc, Sóc Tráng.\nVùng III: gồm các phường Vị Thanh, Vị Tân, Đại Thành, Ngã Bảy, Vĩnh Phước, Vĩnh Châu, Khánh Hòa, Ngã Năm, Mỹ Quới và các xã Tân Long, Phong Điền, Nhơn Ái, Trường Long, Thới Lai, Đồng Thuận, Trường Xuân, Trường Thành, Cờ Đỏ, Đồng Hiệp, Thạnh Phú, Thới Hưng, Trung Hưng, Vĩnh Thanh, Vĩnh Trinh, Thanh An, Thanh Quới, Hòa Lựu, Thạnh Xuân, Tân Hòa, Trường Long Tây, Châu Thành, Đồng Phước, Phú Hữu, Vĩnh Hải, Lai Hòa.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '34. Tỉnh Cà Mau', detail: 'Vùng II: gồm các phường An Xuyên, Lý Văn Lâm, Tân Thành, Hòa Thành, Bạc Liêu, Vĩnh Trạch, Hiệp Thành.\nVùng III: gồm các phường Giá Rai, Làng Trôn và các xã Ú Minh, Nguyễn Phích, Khánh Lâm, Khánh An, Khánh Bình, Đa Bạc, Khánh Hưng, Sông Đốc, Trần Văn Thời, Đất Mới, Năm Căn, Tam Giang, Lương Thế Trân, Hưng Mỹ, Cái Nước, Tân Hưng, Phú Mỹ, Phong Thạnh, Hòa Bình, Vĩnh Mỹ, Vĩnh Hậu.\nVùng IV: gồm các xã, phường còn lại.' },
];

const PROVINCES_ND73 = [
    { name: '1. Tỉnh Lào Cai', detail: 'Vùng II: gồm các phường Cam Đường, Lào Cai và các xã Cốc San, Hợp Thành, Gia Phú.\nVùng III: gồm các phường Văn Phú, Yên Bái, Nam Cường, Âu Lâu, Sa Pa và các xã Phong Hải, Xuân Quang, Bảo Thắng, Tằng Loỏng, Mường Bo, Bản Hồ, Tả Phìn, Tả Van, Ngũ Chỉ Sơn.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '2. Tỉnh Cao Bằng', detail: 'Vùng III: gồm các phường Thúc Phán, Nùng Trí Cao, Tân Giang.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '3. Tỉnh Điện Biên', detail: 'Vùng III: gồm các phường Điện Biên Phủ, Mường Thanh và xã Mường Phăng, Nà Tấu.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '4. Tỉnh Lai Châu', detail: 'Vùng III: gồm các phường Tân Phong, Đoàn Kết.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '5. Tỉnh Sơn La', detail: 'Vùng III: gồm các phường Tô Hiệu, Chiềng An, Chiềng Cơi, Chiềng Sinh.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '6. Tỉnh Tuyên Quang', detail: 'Vùng III: gồm các phường Mỵ Lâm, Minh Xuân, Nông Tiến, An Tường, Bình Thuận, Hà Giang 1, Hà Giang 2 và xã Ngọc Đường.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '7. Tỉnh Lạng Sơn', detail: 'Vùng III: gồm các phường Tam Thanh, Lương Văn Trị, Hoàng Văn Thụ, Đông Kinh.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '8. Tỉnh Phú Thọ', detail: 'Vùng II: gồm các phường Việt Trì, Nông Trang, Thanh Miếu, Văn Phú, Vĩnh Phúc, Vĩnh Yên, Phúc Yên, Xuân Hòa, Hòa Bình, Kỳ Sơn, Tần Hòa, Thống Nhất và các xã Hy Cương, Yên Lạc, Tề Lỗ, Liên Châu, Bình Xuyên, Lương Sơn, Cao Đường, Liễn Sơn, Thịnh Minh.\nVùng III: gồm các phường Phong Châu, Phú Thọ, Âu Cơ và các xã Lâm Thao, Xuân Lũng, Phụng Nguyên, Phù Ninh, Thanh Ba, Đồng Thịnh và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '9. Tỉnh Quảng Ninh', detail: 'Vùng I: gồm các phường An Sinh, Đồng Triều, Bình Khê, Mạo Khê, Hoàng Quế, Yên Tử, Vàng Danh, Uông Bí, Đông Mai, Hiệp Hòa, Quảng Yên, Hà An, Phong Cốc, Liên Hòa, Tuần Châu, Việt Hưng, Bãi Cháy, Hà Tu, Hà Lầm, Cao Xanh, Hồng Gai, Hạ Long, Hoành Bồ, Mộng Cái 1, Mộng Cái 2, Mộng Cái 3 và các xã Quảng La, Thống Nhất, Hải Sơn, Hải Ninh, Vĩnh Thực.\nVùng II: gồm các phường Mộng Dương, Quang Hanh, Cẩm Phả, Cửa Ông và xã Hải Hòa.\nVùng III: gồm các xã Tiên Yên, Điền Xá, Đồng Ngũ, Hải Lạng, Quảng Tân, Đầm Hà, Quảng Hà, Đường Hoa, Quảng Đức, Cái Chiên và đặc khu Vân Đồn.\nVùng IV: gồm các xã, phường và đặc khu còn lại.' },
    { name: '10. Thành phố Hải Phòng', detail: 'Vùng I: gồm các phường Thủy Nguyên, Thiên Hương, Hòa Bình, Nam Triệu, Bạch Đằng, Lưu Kiếm, Lê Ích Mộc, Hồng Bảng, Hồng An, Ngô Quyền, Gia Viên, Lê Chân, An Biên, Hải An, Đồng Hải, Kiến An, Nam Đố, Đồ Sơn, Hưng Đạo, Dương Kinh, An Dương, An Hải, An Phong, Việt Hòa, Thành Đông, Nam Đồng, Tân Hưng, Thạch Khôi, Tứ Minh, Ái Quốc, Chí Linh, Trần Hưng Đạo, Nguyễn Trãi, Lê Đại Hành, Kinh Môn và nhiều phường khác.\nVùng II: gồm các xã Thanh Hà, Hà Nam, Ninh Giang, Vĩnh Lại, Tân An, Hồng Châu, Thanh Miện, Hải Hưng và đặc khu Bạch Long Vĩ.\nVùng III: gồm các xã, phường còn lại.' },
    { name: '11. Tỉnh Hưng Yên', detail: 'Vùng II: gồm các phường Phố Hiến, Sơn Nam, Hồng Châu, Mỹ Hào, Đường Hào, Thượng Hồng, Thái Bình, Trần Hưng Đạo, Trà Lý, Vũ Phúc và các xã Tân Hưng, Yên Mỹ, Như Quỳnh, Lạc Đạo, Đại Đồng, Văn Giang, Mễ Sở.\nVùng III: gồm các xã Hoàng Hoa Thám, Tiền Lữ, Tiên Hoa, Quang Hưng, Đoàn Đào, Tiến Thắng, Tống Trân, Lương Bằng, Nghĩa Dân, Hiệp Cường, Đức Hợp, Ân Thi và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '12. Tỉnh Thái Nguyên', detail: 'Vùng II: gồm các phường Phan Đình Phùng, Linh Sơn, Tích Lương, Gia Sàng, Quyết Thắng, Quan Triều, Phố Yên, Vạn Xuân, Trung Thành, Phúc Thuận, Sông Công, Bá Xuyên, Bách Quang và các xã Tân Cương, Đại Phúc, Thành Công.\nVùng III: gồm các phường Đức Xuân, Bắc Kạn và các xã Đại Từ, Đức Lương, Phú Thịnh, La Bằng, Phú Lạc, An Khánh, Quân Chu, Vạn Phú, Phú Bình, Đồng Hỷ, Quang Sơn, Trại Cau, Nam Hòa, Văn Hán, Văn Lăng, Phú Lương, Võ Tranh, Yên Trạch, Hợp Thành, Phong Quang.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '13. Tỉnh Bắc Ninh', detail: 'Vùng II: gồm nhiều phường Kinh Bắc, Thuận Thành, Quế Võ, Yên Phong, Tiền Du và các xã lân cận.\nVùng III: gồm các xã Lạng Giang, Mỹ Thái, Kép, Tân Dĩnh, Tiến Lực, Tân Yên, Ngọc Thiện, Nhã Nam, Phúc Hòa, Quang Trung, Hợp Thịnh, Hiệp Hòa, Hoàng Vân, Xuân Cẩm.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '14. Thành phố Hà Nội', detail: 'Vùng II: gồm các xã Phương Đức, Chuyên Mỹ, Đại Xuyên, Văn Điển, Ứng Thiên, Hòa Xá, Ứng Hòa, Mỹ Đức, Hồng Sơn, Phúc Sơn, Hương Sơn, Minh Quang, Quảng Oai, Vật Lại, Cổ Đô, Bất Bạt, Suối Hai, Ba Vì, Phúc Thọ, Phúc Lộc, Hát Môn, Đan Phượng.\nVùng I: gồm các xã, phường còn lại.' },
    { name: '15. Tỉnh Ninh Bình', detail: 'Vùng II: gồm các phường Tây Hoa Lư, Hoa Lư, Nam Hoa Lư, Đông Hoa Lư, Nam Định, Thiên Trường, Đông A, Vị Khê, Thành Nam, Trường Thi, Hồng Quang, Mỹ Lộc.\nVùng III: gồm các phường Tam Điệp, Yên Sơn, Trung Sơn, Yên Thắng và nhiều xã thuộc Ninh Bình, Nam Định, Hà Nam.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '16. Tỉnh Thanh Hóa', detail: 'Vùng II: gồm các phường Hạc Thành, Quảng Phú, Đông Quang, Đông Sơn, Đông Tiến, Hàm Rồng, Nguyệt Viên, Sầm Sơn, Nam Sầm Sơn, Bỉm Sơn, Quảng Trung, Ngọc Sơn, Tân Đàn, Hải Linh và nhiều xã lân cận.\nVùng III: gồm các xã Hà Trung, Tống Sơn, Hà Long, Hoạt Giang và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '17. Tỉnh Nghệ An', detail: 'Vùng II: gồm các phường Trường Vinh, Thành Vinh, Vinh Hưng, Vinh Phú, Vinh Lộc, Cửa Lò và các xã Hưng Nguyên, Yên Trung và nhiều xã lân cận.\nVùng III: gồm các phường Hoàng Mai, Tân Mai, Quỳnh Mai, Thái Hòa và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '18. Tỉnh Hà Tĩnh', detail: 'Vùng III: gồm các phường Sông Trì, Hải Ninh, Hoành Sơn, Vũng Áng, Thành Sen, Trần Phú, Hà Huy Tập và các xã Thạch Lạc, Đồng Tiến, Thạch Khê, Cẩm Bình, Kỳ Hoa.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '19. Tỉnh Quảng Trị', detail: 'Vùng II: gồm các phường Đồng Hới, Đồng Thuận, Đồng Sơn.\nVùng III: gồm các phường Đồng Hà, Nam Đồng Hà, Ba Đồn, Bắc Gianh và nhiều xã khác.\nVùng IV: gồm các xã, phường và đặc khu còn lại.' },
    { name: '20. Thành phố Huế', detail: 'Vùng II: gồm các phường Thuận An, Hóa Châu, Mỹ Thượng, Vỹ Dạ, Thuận Hóa, An Cựu, Thủy Xuân, Kim Long, Hương An, Phú Xuân, Dương Nổ.\nVùng III: gồm các phường Phong Điền, Phong Thái, Phong Định, Phong Phú, Phong Quảng và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '21. Thành phố Đà Nẵng', detail: 'Vùng I: gồm các phường Hải Châu, Hòa Cường, Thanh Khê, An Khê, An Hải, Sơn Trà, Ngũ Hành Sơn, Hòa Khánh, Hải Vân, Liên Chiểu, Cẩm Lệ, Hòa Xuân, Tam Kỳ, Quảng Phú, Hương Trà, Bàn Thạch, Hội An và nhiều phường khác.\nVùng II: gồm các phường Điện Bàn và nhiều xã khác.\nVùng III: gồm các xã, phường còn lại.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '22. Tỉnh Quảng Ngãi', detail: 'Vùng III: gồm các phường Trương Quang Trọng, Cẩm Thành, Nghĩa Lộ, Kon Tum, Đắk Cấm, Đắk Bla và nhiều xã khác.\nVùng IV: gồm các xã, phường và đặc khu còn lại.' },
    { name: '23. Tỉnh Đắk Lắk', detail: 'Vùng III: gồm các phường Buôn Ma Thuột, Tân An, Tân Lập, Nguyễn Đại, Sông Cầu, Thống Nhất, Ea Kao, Tuy Hòa, Phú Yên, Bình Kiến, Đồng Hòa, Hòa Hiệp và các xã Hòa Phú, Xuân Thọ, Xuân Cảnh, Xuân Lộc, Hòa Xuân.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '24. Tỉnh Khánh Hòa', detail: 'Vùng II: gồm các phường Nha Trang, Bắc Nha Trang, Tây Nha Trang, Nam Nha Trang, Bắc Cam Ranh, Cam Ranh, Cam Linh, Bà Ngòi, Ninh Hòa, Đồng Ninh Hòa, Hòa Thắng, Phan Rang, Đồng Hải và nhiều xã lân cận.\nVùng III: gồm các xã Đại Lãnh, Tu Bông, Vạn Thắng, Vạn Ninh và nhiều xã khác.\nVùng IV: gồm các xã, phường và đặc khu còn lại.' },
    { name: '25. Tỉnh Gia Lai', detail: 'Vùng III: gồm các phường Quy Nhơn, Quy Nhơn Đông, Quy Nhơn Tây, Quy Nhơn Nam, Quy Nhơn Bắc, Pleiku, Hội Phú, Thống Nhất, Diên Hồng, An Phú và các xã Biển Hồ, Gào.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '26. Tỉnh Lâm Đồng', detail: 'Vùng II: gồm các phường Xuân Hương - Đà Lạt, Cam Ly - Đà Lạt, Làm Viên - Đà Lạt, Xuân Trường - Đà Lạt và nhiều phường khác.\nVùng III: gồm nhiều xã thuộc Đức Trọng, Di Linh, Bảo Lâm, Đạ Huoai và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '27. Thành phố Hồ Chí Minh', detail: 'Vùng III: gồm các xã Ngãi Giao, Bình Giã, Kim Long, Châu Đức, Xuân Sơn, Nghĩa Thành, Hòa Hiệp, Bình Châu, Hố Trầm, Xuyên Mộc, Mộc Hòa, Hòa Hội, Bầu Lâm, Phước Hội, Lộ Đức, Long Điền và đặc khu Côn Đảo.\nVùng II: gồm các phường Bà Rịa, Long Hương, Tam Long và các xã Bình Khánh, An Thời Đông, Cần Giờ, Thạnh An; các xã Kim Long, Châu Đức, Ngãi Giao, Nghĩa Thành, Long Hải, Long Điền.\nVùng I: gồm các xã, phường còn lại.' },
    { name: '28. Tỉnh Đồng Nai', detail: 'Vùng I: gồm các phường Biên Hòa, Trản Biên, Tam Hiệp, Long Bình, Tràng Dài, Hố Nai, Long Hưng, Bình Lộc, Bảo Vinh, Xuân Lập, Long Khánh, Hàng Gòn và nhiều phường khác.\nVùng II: gồm các phường Minh Hưng, Chơn Thành, Đồng Xoài, Bình Phước và nhiều xã khác.\nVùng III: gồm các phường Thiên Hưng, Hưng Phước, Phú Nghĩa, Đa Kia và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '29. Tỉnh Tây Ninh', detail: 'Vùng I: gồm các phường Long An, Tân An, Khánh Hậu và nhiều xã lân cận.\nVùng II: gồm các phường Kiến Tường, Tân Ninh, Bình Minh, Ninh Thạnh, Long Hoa, Hòa Thành, Thanh Điền và nhiều xã khác.\nVùng III: gồm các xã Bình Thành, Thanh Phước, Thanh Hòa và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '30. Tỉnh Đồng Tháp', detail: 'Vùng II: gồm các phường Mỹ Tho, Đạo Thanh, Mỹ Phong, Thới Sơn, Trung An và nhiều xã lân cận.\nVùng III: gồm các phường Gò Công, Long Thuận, Son Qui, Bình Xuân và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '31. Tỉnh Vĩnh Long', detail: 'Vùng II: gồm các phường Thanh Đức, Long Châu, Phước Hậu, Tân Hạnh, Tân Ngãi, Bình Minh, Cái Vồn, Đồng Thành, An Hội và nhiều xã lân cận.\nVùng III: gồm các phường Duyên Hải, Trường Long Hòa và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
    { name: '32. Tỉnh An Giang', detail: 'Vùng II: gồm các phường Long Xuyên, Bình Đức, Mỹ Thới, Châu Đốc, Vĩnh Tế, Vĩnh Thông, Rạch Giá, Hà Tiên và nhiều phường khác.\nVùng III: gồm nhiều xã thuộc Tân Châu, Châu Phú, Thoại Sơn, Kiên Giang và nhiều xã khác.\nVùng IV: gồm các xã, phường còn lại.' },
];

const FAQS = [
    { q: 'Lương Gross là gì?', a: 'Lương Gross (hay còn gọi là lương gộp/lương trước thuế) là tổng thu nhập của người lao động, bao gồm cả thuế, các khoản đóng bảo hiểm và các phụ cấp khác. Đây là số tiền được thỏa thuận giữa người lao động và nhà tuyển dụng khi ký hợp đồng.' },
    { q: 'Lương Net là gì?', a: 'Lương Net (hay còn gọi là lương rộng/lương sau thuế) là số tiền người lao động thực nhận sau khi đã trừ đi các khoản bảo hiểm (BHXH, BHYT, BHTN) và thuế thu nhập cá nhân.' },
    { q: 'Công thức tính lương Gross là gì?', a: 'Lương Gross = Lương cơ bản + Thưởng + Các khoản chi phí khác (phụ cấp, hoa hồng...).' },
    { q: 'Công thức tính lương Net là gì?', a: 'Lương Net = Tổng thu nhập − (Thuế thu nhập cá nhân + Bảo hiểm xã hội 8% + Bảo hiểm y tế 1.5% + Bảo hiểm thất nghiệp 1% + Các khoản khấu trừ khác).' },
    { q: 'Cách tính lương Gross sang Net?', a: 'Từ Gross, trừ đi BHXH (8%), BHYT (1.5%), BHTN (1%) để có thu nhập trước thuế. Sau đó trừ giảm trừ gia cảnh để ra thu nhập tính thuế, rồi áp thuế lũy tiến 7 bậc. Lương Net = Thu nhập trước thuế − Thuế TNCN.' },
    { q: 'Cách quy đổi lương Net sang Gross?', a: 'Đây là bài toán tính ngược phức tạp do thuế TNCN theo biểu lũy tiến. Bạn chỉ cần nhập lương Net vào ô Thu Nhập và bấm "NET → GROSS", công cụ sẽ tự tính toán cho bạn.' },
    { q: 'Lương Net có bao gồm thuế thu nhập cá nhân không?', a: 'Không. Lương Net là số tiền thực nhận sau khi đã trừ thuế TNCN. Thuế TNCN được trừ trực tiếp từ lương Gross, không được tính vào lương Net.' },
    { q: 'Nên deal lương Gross hay Net?', a: 'Nên deal lương Gross để nắm rõ các khoản phải đóng hàng tháng. Dù đàm phán bằng loại lương nào, nhà tuyển dụng cũng tính toán sao cho tổng chi phí tương đương. Lương Gross giúp bạn minh bạch hơn về quyền lợi bảo hiểm.' },
];

export default function TinhLuongGrossNetPage() {
    const calcRef = useRef(null);
    const [periodId, setPeriodId] = useState('nd293');
    const [inputValue, setInputValue] = useState('');
    const [dependants, setDependants] = useState(0);
    const [region, setRegion] = useState('I');
    const [result, setResult] = useState(null);
    const [mode, setMode] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);
    const [showMinWageModal, setShowMinWageModal] = useState(false);

    const period = PERIODS.find(p => p.id === periodId);

    const handleCalc = (calcMode) => {
        const raw = parseInput(inputValue);
        if (!raw || raw <= 0) return;
        setMode(calcMode);
        if (calcMode === 'gross-to-net') setResult(calcGrossToNet(raw, dependants, period));
        else setResult(calcNetToGross(raw, dependants, period));
        setTimeout(() => {
            document.getElementById('salary-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
            <MinWageModal show={showMinWageModal} onClose={() => setShowMinWageModal(false)} period={period} periodId={periodId} />
            <style>{`
                @media (max-width: 768px) {
                    .gross-layout { flex-direction: column !important; }
                    .gross-sidebar { width: 100% !important; }
                    .gross-info-cards { grid-template-columns: 1fr !important; }
                    .gross-inputs-row { flex-direction: column !important; }
                    .gross-dependants { width: 100% !important; }
                    .gross-result-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>

            {/* Main layout */}
            <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '32px 16px' }}>
                <div className="gross-layout" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

                    {/* ── Left ── */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 ref={calcRef} style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '20px', lineHeight: 1.3 }}>
                            Công cụ tính lương Gross sang Net và ngược lại [Chuẩn 2026]
                        </h1>

                        {/* Period toggle */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>Áp dụng quy định:</span>
                            {PERIODS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => { setPeriodId(p.id); setResult(null); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                                        border: `1.5px solid ${periodId === p.id ? '#00b14f' : '#d1d5db'}`,
                                        background: periodId === p.id ? '#00b14f' : 'white',
                                        color: periodId === p.id ? 'white' : '#374151',
                                    }}
                                >
                                    {p.label}
                                    {p.badge && (
                                        <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '10px', padding: '1px 5px', borderRadius: '8px', fontWeight: '700' }}>
                                            {p.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Info text */}
                        <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.7, marginBottom: '16px' }}>
                            <p style={{ margin: '0 0 4px' }}>
                                Áp dụng lương cơ sở mới nhất có hiệu lực từ ngày 01/07/2024 (Theo Nghị định số 73/2024/NĐ-CP)
                            </p>
                            <p style={{ margin: '0 0 4px' }}>
                                Áp dụng{' '}
                                <button onClick={() => setShowMinWageModal(true)} style={{ color: '#dc2626', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, textDecoration: 'underline' }}>
                                    mức lương tối thiểu vùng
                                </button>
                                {' '}mới nhất có hiệu lực từ ngày {period.minWageDate} (Theo Nghị định {period.minWageDecree})
                            </p>
                            <p style={{ margin: '0 0 4px' }}>
                                Áp dụng mức giảm trừ gia cảnh mới nhất: <strong>{fmt(period.personalDeduction / 1e6 * 1e6)} đồng/tháng</strong> ({fmt(period.personalDeduction * 12)} đồng/năm) với người nộp thuế và <strong>{fmt(period.dependantDeduction)} đồng/tháng</strong> với mỗi người phụ thuộc
                            </p>
                            <p style={{ margin: 0, color: '#dc2626', fontSize: '12px' }}>
                                Căn cứ vào Luật Thuế thu nhập cá nhân số 109/2025/QH15, biểu thuế mới gồm 7 bậc từ 5 bậc có hiệu lực thi hành từ ngày 01 tháng 07 năm 2026.
                            </p>
                        </div>

                        {/* Info cards */}
                        <div className="gross-info-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
                            {[
                                { label: 'Lương cơ sở:', value: '2,340,000đ' },
                                { label: 'Giảm trừ gia cảnh bản thân:', value: `${fmt(period.personalDeduction)}đ` },
                                { label: 'Người phụ thuộc:', value: `${fmt(period.dependantDeduction)}đ` },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 14px' }}>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{label}</div>
                                    <div style={{ fontSize: '17px', fontWeight: '700', color: '#00b14f' }}>{value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Calculator card */}
                        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                            {/* Inputs row */}
                            <div className="gross-inputs-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Thu Nhập:</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '15px' }}>$</span>
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={e => setInputValue(formatInput(e.target.value))}
                                            placeholder="Nhập mức lương..."
                                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 56px 10px 32px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                                        />
                                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '12px' }}>(VNĐ)</span>
                                    </div>
                                </div>
                                <div className="gross-dependants" style={{ width: '180px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Số người phụ thuộc:</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', border: '1.5px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
                                        <span style={{ position: 'absolute', left: '10px', color: '#9ca3af', fontSize: '14px' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        </span>
                                        <input
                                            type="number" min="0" max="10" value={dependants}
                                            onChange={e => setDependants(Math.max(0, parseInt(e.target.value) || 0))}
                                            style={{ width: '100%', padding: '10px 50px 10px 34px', border: 'none', fontSize: '15px', outline: 'none' }}
                                        />
                                        <span style={{ position: 'absolute', right: '10px', color: '#9ca3af', fontSize: '12px' }}>(Người)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Region */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Vùng:
                                    <button
                                        onClick={() => setShowMinWageModal(true)}
                                        style={{ fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: '500', textDecoration: 'underline' }}
                                    >
                                        (Giải thích)
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '28px', marginBottom: '6px' }}>
                                    {['I', 'II', 'III', 'IV'].map(r => (
                                        <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                                            <input type="radio" name="region" value={r} checked={region === r} onChange={() => setRegion(r)} style={{ accentColor: '#00b14f' }} />
                                            {r}
                                        </label>
                                    ))}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                    Lương tối thiểu vùng {region}: <strong style={{ color: '#00b14f' }}>{fmt(period.minWage[region])}đ/tháng</strong>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => handleCalc('gross-to-net')}
                                    style={{ flex: 1, padding: '13px', background: '#00b14f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px' }}
                                >
                                    GROSS → NET
                                </button>
                                <button
                                    onClick={() => handleCalc('net-to-gross')}
                                    style={{ flex: 1, padding: '13px', background: 'white', color: '#00b14f', border: '2px solid #00b14f', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px' }}
                                >
                                    NET → GROSS
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        {result && (
                            <div id="salary-result" style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Kết quả</h2>

                                <div className="gross-result-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: '#f9fafb', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
                                    {[
                                        { label: 'Lương Gross', val: result.gross, color: '#1f2937' },
                                        { label: 'Bảo hiểm', val: result.totalBH, neg: true, color: '#ef4444' },
                                        { label: 'Thuế TNCN', val: result.tax, neg: true, color: '#ef4444' },
                                        { label: 'Lương Net', val: result.net, color: '#00b14f' },
                                    ].map(({ label, val, neg, color }, i) => (
                                        <div key={i} style={{ padding: '16px 10px', textAlign: 'center', borderRight: i < 3 ? '1px solid #e5e7eb' : 'none' }}>
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>{label}</div>
                                            <div style={{ fontSize: '15px', fontWeight: '700', color }}>
                                                {neg ? `- ${fmt(val)}` : fmt(val)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ textAlign: 'center', padding: '10px', background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: '6px', fontSize: '13px', color: '#374151', marginBottom: '16px' }}>
                                    Nếu bạn thấy hữu ích, hãy like <strong>Fanpage TopCV</strong> để ủng hộ chúng tôi
                                </div>

                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#00b14f', marginBottom: '10px' }}>Diễn giải chi tiết (VNĐ)</div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '20px' }}>
                                    <tbody>
                                        {[
                                            { label: 'Lương GROSS', val: result.gross },
                                            { label: 'Bảo hiểm xã hội (8%)', val: result.bhXH, neg: true },
                                            { label: 'Bảo hiểm y tế (1.5%)', val: result.bhYT, neg: true },
                                            { label: 'Bảo hiểm thất nghiệp (1%)', val: result.bhTN, neg: true },
                                            { label: 'Thu nhập trước thuế', val: result.incomeBeforeTax, divider: true },
                                            { label: 'Giảm trừ gia cảnh bản thân', val: period.personalDeduction, neg: true },
                                            { label: 'Giảm trừ người phụ thuộc', val: dependants * period.dependantDeduction, neg: true },
                                            { label: 'Thu nhập chịu thuế', val: result.taxableIncome, divider: true },
                                            { label: 'Thuế thu nhập cá nhân(*)', val: result.tax, neg: true },
                                            { label: 'Lương NET\n(Thu nhập trước thuế – Thuế TNCN)', val: result.net, bold: true, highlight: true },
                                        ].map(({ label, val, neg, bold, highlight, divider }, i) => (
                                            <tr key={i} style={{ borderTop: divider ? '2px solid #e5e7eb' : '1px solid #f3f4f6', background: highlight ? '#f0fdf4' : 'transparent' }}>
                                                <td style={{ padding: '8px 12px', color: '#374151', fontWeight: bold ? '700' : '400', whiteSpace: 'pre-line', lineHeight: 1.4 }}>{label}</td>
                                                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: bold ? '700' : '400', color: neg ? '#ef4444' : highlight ? '#00b14f' : '#1f2937' }}>
                                                    {neg ? `- ${fmt(val)}` : fmt(val)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#00b14f', marginBottom: '10px' }}>(*) Chi tiết thuế thu nhập cá nhân (VNĐ)</div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                                    <thead>
                                        <tr style={{ background: '#f9fafb' }}>
                                            {['Mức chịu thuế', 'Thuế suất', 'Lương chịu thuế', 'Tiền nộp'].map((h, i) => (
                                                <th key={h} style={{ padding: '8px 12px', textAlign: i > 1 ? 'right' : i === 1 ? 'center' : 'left', color: '#6b7280', fontWeight: '600', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getBracketRows(result.taxableIncome).map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '7px 12px', color: '#374151' }}>{row.label}</td>
                                                <td style={{ padding: '7px 12px', textAlign: 'center', color: '#374151' }}>{row.rate}</td>
                                                <td style={{ padding: '7px 12px', textAlign: 'right', color: '#374151' }}>{fmt(row.chiu)}</td>
                                                <td style={{ padding: '7px 12px', textAlign: 'right', color: '#374151' }}>{fmt(row.tien)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#00b14f', marginBottom: '10px' }}>Người sử dụng lao động trả (VNĐ)</div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <tbody>
                                        {[
                                            { label: 'Lương GROSS', val: result.gross },
                                            { label: 'Bảo hiểm xã hội (17%)', val: Math.round(result.gross * 0.17) },
                                            { label: 'Bảo hiểm Tai nạn LĐ - Bệnh nghề nghiệp (0.5%)', val: Math.round(result.gross * 0.005) },
                                            { label: 'Bảo hiểm y tế (3%)', val: Math.round(result.gross * 0.03) },
                                            { label: 'Bảo hiểm thất nghiệp (1%)', val: Math.round(result.gross * 0.01) },
                                        ].map(({ label, val }, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '8px 12px', color: '#374151' }}>{label}</td>
                                                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#1f2937' }}>{fmt(val)}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: '700', color: '#1f2937' }}>Tổng cộng</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#1f2937', fontSize: '15px' }}>
                                                {fmt(result.gross + result.employerBH)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Article content */}
                        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '24px', fontSize: '14px', color: '#374151', lineHeight: 1.75 }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Cách tính lương Gross và lương Net</h2>
                            <p>Lương Net và lương Gross đều là mức lương được thỏa thuận giữa người lao động và nhà tuyển dụng. Tuy nhiên, lương Net và lương Gross có khác biệt đáng kể. Vậy lương Gross là gì, lương Net là gì? Mối quan hệ giữa lương Gross và lương Net là gì? TopCV sẽ giúp bạn giải đáp ngay sau đây.</p>
                            <p><strong>Lương Gross</strong> (hay còn là lương gộp/lương trước thuế) là tổng thu nhập của người lao động, bao gồm cả thuế, các khoản đóng bảo hiểm (bảo hiểm y tế, bảo hiểm xã hội, bảo hiểm thất nghiệp), và các phụ cấp khác. Mức lương thực nhận của bạn thường sẽ thấp hơn mức này vì bạn phải trích ra một phần để đóng bảo hiểm và nộp thuế thu nhập cá nhân.</p>
                            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px 16px', margin: '12px 0', textAlign: 'center', fontWeight: '600', color: '#111827' }}>
                                Lương Gross = Lương cơ bản + Thưởng + Các khoản chi phí khác
                            </div>
                            <p><strong>Lương Net</strong> (hay còn gọi là lương rộng/lương sau thuế) là số tiền người lao động thực nhận sau khi trừ đi các khoản bảo hiểm, giảm trừ gia cảnh, và các khoản khác (nếu có). Khi đàm phán lương, nếu bạn muốn biết chính xác số tiền thực tế thì có thể deal lương Net thay vì Gross.</p>
                            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px 16px', margin: '12px 0', textAlign: 'center', fontWeight: '600', color: '#111827' }}>
                                Lương Net = Tổng thu nhập - (Thuế TNCN + BHXH + BHYT + BHTN + Các khoản khấu trừ khác)
                            </div>

                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '24px 0 12px' }}>Lương Gross hay lương Net có lợi hơn cho người lao động?</h2>
                            <p>Thoạt nhìn, có thể bạn cho rằng lương Net có lợi hơn vì đó là số tiền bạn thực nhận, còn lương Gross thì bạn có cảm giác bị mất đi một khoản khi nhận lương.</p>
                            <p>Tuy nhiên trên thực tế, dù bạn quy đổi lương Net sang Gross – hay từ Gross sang Net, thì số tiền bạn nhận được cũng không thay đổi. Dù bạn đàm phán với nhà tuyển dụng bằng cách nào thì nhà tuyển dụng cũng sẽ tính toán để chi phí phải trả cho bạn nằm trong mức khoản nhất định.</p>
                            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px 16px', margin: '12px 0', fontSize: '13px', color: '#374151' }}>
                                <strong>Ví dụ:</strong> Mức lương Gross là 25.000.000 đồng sẽ tương đương với mức lương Net 22.031.250 trong trường hợp đóng bảo hiểm trên lương chính thức.<br />
                                Vậy nên khi nhà tuyển dụng quyết định trả bạn mức lương Gross là 25.000.000 đồng, nếu bạn đàm phán mức lương Net thì lương của bạn sẽ là 22.031.250 đồng và ngược lại.
                            </div>
                            <p>Tuy nhiên nếu tính ý, bạn sẽ thấy rằng khi sử dụng lương Gross mức lương bạn nhận được sẽ minh bạch hơn. Với mức lương Gross bạn sẽ chủ động tính toán được mức lương Net của mình và biết được các khoản bảo hiểm, thuế mà công ty đóng cho bạn, ngược lại với lương Net có thể bạn sẽ không biết được các khoản bảo hiểm công ty đóng cho mình là bao nhiêu.</p>
                            <p>Vậy nên, nếu có thể thì hãy đàm phán với nhà tuyển dụng bằng lương Gross, còn nếu nhà tuyển dụng và bạn làm việc với nhau trên lương Net thì bạn có thể hỏi rõ về mức đóng bảo hiểm mà công ty đóng cho bạn để nắm được chính xác hơn quyền lợi của mình.</p>
                        </div>

                        {/* Banner at bottom — click scrolls to calculator */}
                        <div
                            style={{ width: '100%', cursor: 'pointer', marginBottom: '24px', borderRadius: '8px', overflow: 'hidden' }}
                            onClick={() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        >
                            <Image src={bannerImg} alt="Công cụ tính lương Net sang Gross, Gross sang Net chuẩn 2026 trên TopCV" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                Công cụ tính lương Net sang Gross, Gross sang Net chuẩn 2026 trên TopCV
                            </p>
                        </div>

                        {/* FAQ */}
                        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Các câu hỏi thường gặp (FAQs)</h2>
                            {FAQS.map(({ q, a }, i) => (
                                <div key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        style={{ width: '100%', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '12px' }}
                                    >
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{q}</span>
                                        <span style={{ fontSize: '18px', color: '#00b14f', flexShrink: 0, lineHeight: 1 }}>{openFaq === i ? '−' : '+'}</span>
                                    </button>
                                    {openFaq === i && (
                                        <div style={{ padding: '0 0 14px', fontSize: '14px', color: '#4b5563', lineHeight: 1.65 }}>{a}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="gross-sidebar" style={{ width: '290px', flexShrink: 0 }}>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '14px', paddingBottom: '10px', borderBottom: '2px solid #00b14f' }}>
                                Bài viết liên quan
                            </h3>
                            {[
                                'Lương Gross là gì? Nên deal lương Gross hay lương Net để có lợi nhất?',
                                'Chi tiết về cách tính thuế TNCN theo lương Gross và lương Net',
                                'Cẩm nang các câu hỏi cần biết về lương Gross và lương Net',
                                'Lương Net là gì? Quy đổi lương Net sang Gross như thế nào?',
                                'Lương cơ bản là gì? Cách tính lương cơ bản mới nhất',
                                'Lương tháng 13 là gì và cách tính chuẩn xác nhất',
                                'Deal lương sau 2 tháng thử việc: Cách biến hiệu quả công việc thành con số thực tế',
                            ].map((title, i) => (
                                <a key={i} href="#" style={{ display: 'block', fontSize: '13px', color: '#00b14f', marginBottom: '10px', lineHeight: 1.5, textDecoration: 'none' }}
                                    onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                                >
                                    {title}
                                </a>
                            ))}
                        </div>

                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                                Tạo CV miễn phí và tìm công việc mơ ước với TopCV
                            </h3>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px', lineHeight: 1.5 }}>
                                50+ mẫu CV "cực đẹp", chỉnh sửa dễ dàng trong 5 phút. Chuyên trang việc làm chất lượng cao.
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <a href="/tao-cv" style={{ flex: 1, padding: '8px', background: '#00b14f', color: 'white', borderRadius: '6px', fontSize: '13px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                                    Tạo CV
                                </a>
                                <a href="/viec-lam" style={{ flex: 1, padding: '8px', background: 'white', color: '#00b14f', border: '1.5px solid #00b14f', borderRadius: '6px', fontSize: '13px', fontWeight: '600', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                                    Tìm việc ngay
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
