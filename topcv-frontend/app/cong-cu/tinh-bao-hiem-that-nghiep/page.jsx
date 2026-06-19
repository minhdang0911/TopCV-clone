'use client';
import { useState } from 'react';
import Image from 'next/image';
import { MapPin, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import MinWageModal from '@/app/components/tools/MinWageModal';
import bannerImg from '@/app/assests/img/bao-hiem-that-nghiep.jpg';

const GREEN = '#00b14f';

const PERIODS = [
    {
        id: 'nd293',
        label: 'Từ 01/01/2026 (Mới nhất)',
        badge: 'Mới nhất',
        decree: 'NĐ 293/2025/NĐ-CP',
        effectiveDate: '01/01/2026',
        minWage: { I: 5_310_000, II: 4_730_000, III: 4_140_000, IV: 3_700_000 },
        minWageDate: '01/01/2026',
        minWageDecree: 'NĐ 293/2025/NĐ-CP',
    },
    {
        id: 'nd128',
        label: 'Từ 01/07/2025 – 31/12/2025',
        badge: null,
        decree: 'NĐ 128/2025/NĐ-CP',
        effectiveDate: '01/07/2025',
        minWage: { I: 5_060_000, II: 4_510_000, III: 3_940_000, IV: 3_530_000 },
        minWageDate: '01/07/2025',
        minWageDecree: 'NĐ 128/2025/NĐ-CP',
    },
];

const ZONES = [
    { key: 'I',   label: 'Vùng 1' },
    { key: 'II',  label: 'Vùng 2' },
    { key: 'III', label: 'Vùng 3' },
    { key: 'IV',  label: 'Vùng 4' },
];

function fmt(n) {
    if (n === null || n === undefined) return '';
    return Math.round(n).toLocaleString('vi-VN');
}

function fmtInput(s) {
    const digits = s.replace(/[^0-9]/g, '');
    if (!digits) return '';
    return parseInt(digits, 10).toLocaleString('vi-VN');
}

function parseNum(s) {
    return parseFloat((s || '').replace(/[^0-9.]/g, '')) || 0;
}

function calcBHTNMonths(months) {
    if (months < 12) return 0;
    let base = 3;
    if (months > 36) base += Math.floor((months - 36) / 12);
    return Math.min(base, 12);
}

function calcBHTN(salary, months, zone, period) {
    const minWageZone = period.minWage[zone];
    const maxBHTNSalary = 20 * minWageZone;
    const appliedSalary = Math.min(salary, maxBHTNSalary);
    const maxMonthlyBenefit = 5 * minWageZone;
    const rawMonthlyBenefit = appliedSalary * 0.6;
    const monthlyBenefit = Math.min(rawMonthlyBenefit, maxMonthlyBenefit);
    const benefitMonths = calcBHTNMonths(months);

    return {
        salary, months, zone: ZONES.find(z => z.key === zone)?.label ?? zone,
        minWageZone, maxBHTNSalary, appliedSalary,
        maxMonthlyBenefit, rawMonthlyBenefit, monthlyBenefit, benefitMonths,
    };
}

const labelStyle = { fontWeight: '600', display: 'block', marginBottom: '4px', fontSize: '14px' };
const hintStyle  = { fontSize: '12px', color: '#6b7280', marginBottom: '6px' };
const inputWrap  = { display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden', background: 'white' };
const plainInput = { width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

const FAQS = [
    { q: 'Làm bảo hiểm thất nghiệp ở đâu?', a: 'Căn cứ theo Nghị định số 374/2025/NĐ-CP, người lao động có thể nộp trực tiếp tại Trung tâm Dịch vụ việc làm của tỉnh/thành phố đang sinh sống hoặc nộp trực tuyến qua Cổng Dịch vụ công Quốc gia.' },
    { q: 'Làm bảo hiểm thất nghiệp cần những giấy tờ gì?', a: 'Để nộp hồ sơ lấy bảo hiểm thất nghiệp bạn cần chuẩn bị: Đề nghị hưởng trợ cấp thất nghiệp; Bản chính hoặc bản sao có chứng thực hoặc bản sao kèm theo bản chính để đối chiếu một trong các giấy tờ như Quyết định sa thải, quyết định thôi việc, quyết định kỷ luật buộc thôi việc, thông báo hoặc thỏa thuận chấm dứt hợp đồng lao động, hợp đồng làm việc, giấy tờ xác nhận chấm dứt hợp đồng lao động đối với lao động mùa vụ hoặc theo một công việc nhất định; Sổ bảo hiểm xã hội.' },
    { q: 'Lãnh bảo hiểm thất nghiệp ở đâu?', a: 'Người lao động đủ điều kiện hưởng bảo hiểm thất nghiệp sẽ nhận tiền qua hai hình thức: Qua tài khoản ngân hàng (Thẻ ATM) – đây là phương thức phổ biến nhất; Nhận trực tiếp tại cơ quan BHXH quận/huyện nơi bạn cư trú nếu không có tài khoản.' },
    { q: 'Nghỉ việc bao lâu thì được hưởng bảo hiểm thất nghiệp?', a: 'Sau khi nghỉ việc, người lao động có thể hưởng bảo hiểm xã hội nếu đáp ứng điều kiện đóng bảo hiểm đủ 12 tháng trong vòng 24 tháng trước khi nghỉ việc. Để có thể nhận bảo hiểm thất nghiệp, người lao động có thể đăng ký để được hưởng trợ cấp thất nghiệp trong vòng 03 tháng kể từ thời điểm chấm dứt hợp đồng.' },
    { q: 'Bảo hiểm thất nghiệp tối đa bao nhiêu tháng?', a: 'Căn cứ theo Khoản 2, Điều 39, Luật Việc làm 2025, thời gian hưởng trợ cấp thất nghiệp được tính theo số tháng mà người lao động đã đóng bảo hiểm thất nghiệp tính tới thời điểm đăng ký hưởng. Số tháng hưởng tối đa cho mỗi lần nhận trợ cấp thất nghiệp là 12 tháng.' },
    { q: 'Bảo hiểm thất nghiệp được nhận mấy lần?', a: 'Pháp luật không giới hạn số lần hưởng trợ cấp thất nghiệp đối với người lao động.' },
    { q: 'Bao nhiêu tuổi thì không được hưởng bảo hiểm thất nghiệp?', a: 'Hiện nay pháp luật không giới hạn độ tuổi được hưởng bảo hiểm thất nghiệp của người lao động. Người lao động vẫn sẽ được hưởng trợ cấp thất nghiệp nếu đủ điều kiện hưởng.' },
    { q: 'Bảo hiểm thất nghiệp được bao nhiêu?', a: 'Căn cứ theo Khoản 1, Điều 39, Luật Việc làm 2025, mức hưởng trợ cấp thất nghiệp hàng tháng bằng 60% mức bình quân tiền lương tháng đóng bảo hiểm thất nghiệp của 06 tháng liền kề trước khi thất nghiệp. Trong đó, mức hưởng bảo hiểm thất nghiệp không quá 05 lần mức lương tối thiểu tháng theo vùng do Chính phủ công bố được áp dụng tại tháng cuối cùng đóng bảo hiểm thất nghiệp.' },
    {
        q: 'Đóng BHTN 1 năm được hưởng bao nhiêu tháng trợ cấp?',
        a: 'Thời gian hưởng BHTN sẽ được tính như sau: Đối với người đóng đủ 12 tháng đến 36 tháng được hưởng 03 tháng trợ cấp; Sau 36 tháng, mỗi 12 tháng tham gia đủ BHTN sẽ được hưởng thêm 01 tháng trợ cấp, số tháng được hưởng trợ cấp thất nghiệp không quá 12 tháng. Cụ thể: Đóng BHTN 1 năm: 3 tháng trợ cấp; Đóng BHTN 2 năm: 3 tháng; Đóng BHTN 3 năm: 3 tháng; Đóng BHTN 4 năm: 4 tháng; Đóng BHTN 5 năm: 5 tháng.',
    },
];

export default function TinhBHTNPage() {
    const [periodId, setPeriodId]         = useState('nd293');
    const [salaryMode, setSalaryMode]     = useState('fixed'); // fixed | variable
    const [salaryStr, setSalaryStr]       = useState('');
    const [monthlySalaries, setMonthlySalaries] = useState(['', '', '', '', '', '']);
    const [monthsStr, setMonthsStr]       = useState('');
    const [zone, setZone]                 = useState('I');
    const [result, setResult]             = useState(null);
    const [showDetail, setShowDetail]     = useState(false);
    const [showModal, setShowModal]       = useState(false);
    const [openFaq, setOpenFaq]           = useState(null);

    const period = PERIODS.find(p => p.id === periodId);

    function handleCalc() {
        let salary;
        if (salaryMode === 'fixed') {
            salary = parseNum(salaryStr);
        } else {
            const nums = monthlySalaries.map(parseNum);
            const nonZero = nums.filter(n => n > 0);
            salary = nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
        }
        const months = parseInt(monthsStr) || 0;
        if (!salary || !months) return;
        setResult(calcBHTN(salary, months, zone, period));
        setShowDetail(false);
    }

    function setMonthSalary(i, val) {
        const next = [...monthlySalaries];
        next[i] = fmtInput(val);
        setMonthlySalaries(next);
    }

    const zoneLabel = ZONES.find(z => z.key === zone)?.label ?? 'Vùng 1';
    const zoneLabelNum = zoneLabel.replace('Vùng ', '');

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', paddingTop: '24px', paddingBottom: '48px' }}>
            <style>{`
                @media (max-width: 768px) {
                    .tool-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
            <MinWageModal show={showModal} onClose={() => setShowModal(false)} period={period} periodId={periodId} />

            <div className="tool-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

                {/* ── LEFT COLUMN ── */}
                <div>
                    {/* CALCULATOR CARD */}
                    <div style={{ background: 'white', borderRadius: '8px', padding: '24px', marginBottom: '16px' }}>
                        <h1 style={{ color: GREEN, fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
                            Công cụ tính mức hưởng bảo hiểm thất nghiệp chính xác nhất 2026
                        </h1>

                        {/* Period selector */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            {PERIODS.map(p => (
                                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                    <input
                                        type="radio" name="period"
                                        checked={periodId === p.id}
                                        onChange={() => { setPeriodId(p.id); setResult(null); }}
                                        style={{ accentColor: GREEN }}
                                    />
                                    <span style={{ fontSize: '14px' }}>{p.label}</span>
                                    {p.badge && (
                                        <span style={{ background: GREEN, color: 'white', fontSize: '11px', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' }}>
                                            {p.badge}
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                        <p style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                            Áp dụng{' '}
                            <span
                                onClick={() => setShowModal(true)}
                                style={{ color: GREEN, textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                mức lương tối thiểu vùng
                            </span>
                            {' '}mới nhất có hiệu lực từ ngày {period.effectiveDate} (Theo {period.decree})
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>
                            Mức hưởng bảo hiểm thất nghiệp được quy định tại Điều 50, Luật Việc làm 2013 và được hướng dẫn chi tiết tại Điều 8, Nghị định 28/2015/NĐ-CP
                        </p>

                        {/* Salary mode */}
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            {[
                                { val: 'fixed',    label: 'Lương đóng BH không thay đổi trong 6 tháng' },
                                { val: 'variable', label: 'Lương đóng BH thay đổi trong 6 tháng' },
                            ].map(o => (
                                <label key={o.val} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                                    <input
                                        type="radio" name="salaryMode"
                                        checked={salaryMode === o.val}
                                        onChange={() => setSalaryMode(o.val)}
                                        style={{ accentColor: GREEN }}
                                    />
                                    {o.label}
                                </label>
                            ))}
                        </div>

                        {/* Salary input(s) */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Tiền lương đóng BHTN</label>
                            {salaryMode === 'fixed' ? (
                                <>
                                    <div style={inputWrap}>
                                        <span style={{ background: GREEN, color: 'white', padding: '10px 14px', fontWeight: '700', fontSize: '18px' }}>+</span>
                                        <input
                                            type="text" placeholder="10,000,000"
                                            value={salaryStr}
                                            onChange={e => setSalaryStr(fmtInput(e.target.value))}
                                            style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: '14px' }}
                                        />
                                        <span style={{ padding: '10px 12px', color: '#9ca3af', fontSize: '13px' }}>VNĐ</span>
                                    </div>
                                    <p style={hintStyle}>(Bình quân tiền lương tháng đóng BHTN của 06 tháng liền kế trước khi thất nghiệp)</p>
                                </>
                            ) : (
                                <>
                                    <p style={hintStyle}>Nhập lương từng tháng (6 tháng gần nhất trước khi thất nghiệp)</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {monthlySalaries.map((s, i) => (
                                            <div key={i}>
                                                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Tháng {i + 1}</p>
                                                <div style={inputWrap}>
                                                    <span style={{ background: GREEN, color: 'white', padding: '8px 12px', fontWeight: '700', fontSize: '16px' }}>+</span>
                                                    <input
                                                        type="text" placeholder="VD: 10,000,000"
                                                        value={s}
                                                        onChange={e => setMonthSalary(i, e.target.value)}
                                                        style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 10px', fontSize: '13px' }}
                                                    />
                                                    <span style={{ padding: '8px 10px', color: '#9ca3af', fontSize: '12px' }}>VNĐ</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Months */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Tổng thời gian đóng BHTN chưa hưởng</label>
                            <div style={inputWrap}>
                                <span style={{ padding: '10px 12px', color: '#9ca3af' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                </span>
                                <input
                                    type="number" min="0" placeholder="12"
                                    value={monthsStr}
                                    onChange={e => setMonthsStr(e.target.value)}
                                    style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 0', fontSize: '14px' }}
                                />
                                <span style={{ padding: '10px 12px', color: '#9ca3af', fontSize: '13px' }}>Tháng</span>
                            </div>
                            <p style={hintStyle}>(Thời gian đóng bảo hiểm thất nghiệp – Thời gian đã hưởng trợ cấp thất nghiệp)</p>
                        </div>

                        {/* Zone */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Vùng</label>
                                <span
                                    onClick={() => setShowModal(true)}
                                    style={{ fontSize: '13px', color: GREEN, textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                    (Giải thích)
                                </span>
                            </div>
                            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', width: '200px' }}>
                                <MapPin size={15} style={{ position: 'absolute', left: '10px', color: '#9ca3af', pointerEvents: 'none' }} />
                                <select
                                    value={zone}
                                    onChange={e => setZone(e.target.value)}
                                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px 10px 10px 30px', fontSize: '14px', outline: 'none', appearance: 'none', background: 'white', cursor: 'pointer' }}
                                >
                                    {ZONES.map(z => (
                                        <option key={z.key} value={z.key}>{z.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', color: '#9ca3af', pointerEvents: 'none' }} />
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button
                                onClick={handleCalc}
                                style={{ background: GREEN, color: 'white', border: 'none', borderRadius: '6px', padding: '12px 48px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Tính bảo hiểm
                            </button>
                        </div>
                    </div>

                    {/* RESULT */}
                    {result && (
                        <div style={{ background: 'white', borderRadius: '8px', padding: '24px', marginBottom: '16px' }}>
                            <p style={{ color: GREEN, fontWeight: '700', fontSize: '17px', marginBottom: '10px' }}>Kết quả</p>
                            <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                                * Mức hưởng BHTN hàng tháng:{' '}
                                <strong style={{ color: GREEN }}>{fmt(result.monthlyBenefit)}</strong>{' '}
                                <span style={{ color: '#6b7280' }}>(Đồng)</span>
                            </p>
                            <p style={{ fontSize: '14px', marginBottom: '20px' }}>
                                * Số tháng hưởng BHTN:{' '}
                                <strong style={{ color: GREEN }}>{result.benefitMonths}</strong>{' '}
                                <span style={{ color: '#6b7280' }}>(Tháng)</span>
                            </p>

                            {/* Summary table */}
                            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ background: '#f9fafb' }}>
                                            {['Tiền lương đóng BHTN', 'Thời gian đóng BHTN chưa hưởng', 'Chế độ lương', 'Vùng', 'Mức hưởng BHTN hàng tháng', 'Số tháng hưởng BHTN'].map(h => (
                                                <th key={h} style={{ padding: '10px 10px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', textAlign: 'center', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{fmt(result.salary)} (đồng)</td>
                                            <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{result.months} (tháng)</td>
                                            <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>Doanh nghiệp tư nhân</td>
                                            <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{zoneLabelNum}</td>
                                            <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{fmt(result.monthlyBenefit)} (đồng)</td>
                                            <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{result.benefitMonths} (tháng)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px 16px', fontSize: '13px', color: '#374151', marginBottom: '16px', textAlign: 'center' }}>
                                Nếu bạn thấy hữu ích, hãy like{' '}
                                <a href="#" style={{ color: GREEN, fontWeight: '600' }}>Fanpage TopCV</a>
                                {' '}để ủng hộ chúng tôi
                            </div>

                            {/* Diễn giải chi tiết */}
                            <div>
                                <button
                                    onClick={() => setShowDetail(v => !v)}
                                    style={{ color: GREEN, fontWeight: '600', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    (*) Diễn giải chi tiết
                                    {showDetail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {showDetail && (
                                    <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                            <tbody>
                                                {[
                                                    { label: '(1) Tiền lương đóng BHTN', val: `${fmt(result.salary)} (Đồng)` },
                                                    { label: `(2) Lương tối thiểu vùng`, val: `${fmt(result.minWageZone)} (Đồng)` },
                                                    { label: '(3) Mức lương tháng được đóng BHTN tối đa (= 20 * (2))', val: `${fmt(result.maxBHTNSalary)} (Đồng)` },
                                                    { label: '(4) Mức lương tháng áp dụng tính BHTN (Không vượt quá mức lương tháng đóng BHTN tối đa (3))', val: `${fmt(result.appliedSalary)} (Đồng)` },
                                                    { label: '(5) Mức hưởng trợ cấp thất nghiệp hàng tháng tối đa (= 5 * (2))', val: `${fmt(result.maxMonthlyBenefit)} (Đồng)` },
                                                    { label: '(6) Thời gian đóng BHTN chưa hưởng', val: `${result.months} (Tháng)` },
                                                    { label: '(7) Chế độ lương', val: 'Doanh nghiệp tư nhân' },
                                                    { label: '(8) Mức trợ cấp hàng tháng theo mức lương áp dụng (= 0.6 * Mức lương tháng áp dụng tính BHTN (4))', val: `${fmt(result.rawMonthlyBenefit)} (Đồng)` },
                                                    { label: '(9) Mức hưởng BHTN hàng tháng thực nhận (Không vượt quá mức hưởng trợ cấp thất nghiệp hàng tháng tối đa (5))', val: `${fmt(result.monthlyBenefit)} (Đồng)` },
                                                    { label: '(10) Số tháng hưởng BHTN', val: `${result.benefitMonths} (Tháng)` },
                                                ].map((row, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        <td style={{ padding: '10px 12px', color: '#374151', width: '65%' }}>{row.label}</td>
                                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '500' }}>{row.val}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ARTICLE */}
                    <div style={{ background: 'white', borderRadius: '8px', padding: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
                            Bảo hiểm thất nghiệp là gì? Cách tính bảo hiểm thất nghiệp mới nhất
                        </h2>

                        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px' }}>Bảo hiểm thất nghiệp là gì?</h3>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '10px' }}>
                            Theo Điều 2, Luật Việc làm số 74/2025/QH15, bảo hiểm thất nghiệp là loại hình bảo hiểm bắt buộc do Nhà nước tổ chức mà người lao động, người sử dụng lao động tham gia để hỗ trợ duy trì việc làm, đào tạo, tư vấn, giới thiệu việc làm và bù đắp một phần thu nhập cho người lao động khi bị mất việc làm trên cơ sở đóng vào Quỹ bảo hiểm thất nghiệp.
                        </p>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '8px' }}>Các chế độ bảo hiểm thất nghiệp bao gồm:</p>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '24px' }}>
                            <li>Tư vấn, giới thiệu việc làm;</li>
                            <li>Hỗ trợ người lao động tham gia đào tạo, nâng cao trình độ kỹ năng nghề;</li>
                            <li>Trợ cấp thất nghiệp;</li>
                            <li>Hỗ trợ người sử dụng lao động đào tạo, bồi dưỡng, nâng cao trình độ kỹ năng nghề để duy trì việc làm cho người lao động.</li>
                        </ul>

                        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px' }}>Công cụ tính bảo hiểm thất nghiệp mới nhất</h3>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>Công thức tính bảo hiểm thất nghiệp</h4>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '12px' }}>
                            Tính đến thời điểm hiện tại, mức lãnh bảo hiểm thất nghiệp được quy định rõ ràng tại Luật Việc làm năm 2025, cụ thể cách tính mức hưởng bảo hiểm thất nghiệp như sau:
                        </p>
                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
                            <p style={{ fontSize: '15px', fontWeight: '600', color: '#374151' }}>
                                Mức hưởng thất nghiệp hàng tháng = Mức trung bình tiền lương đóng bảo hiểm thất nghiệp hàng tháng của 06 tháng gần nhất trước khi thất nghiệp * 60%
                            </p>
                        </div>
                        <p style={{ color: '#c0392b', lineHeight: '1.75', marginBottom: '16px', fontStyle: 'italic' }}>
                            Quan trọng: Mức hưởng lương hàng tháng tối đa không quá 05 lần mức lương tối thiểu tháng theo vùng do Chính phủ công bố được áp dụng tại tháng cuối cùng đóng bảo hiểm thất nghiệp.
                        </p>

                        {/* Min wage table */}
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '10px' }}>
                            Căn cứ theo Điều 3 Nghị định số 293/2025/NĐ-CP, mức lương tối thiểu tháng và mức lương tối thiểu giờ đối với người lao động làm việc cho người sử dụng lao động theo vùng được quy định như sau:
                        </p>
                        <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {['Vùng', 'Mức lương tối thiểu tháng\n(Đơn vị: đồng/tháng)', 'Mức lương tối thiểu giờ\n(Đơn vị: đồng/giờ)'].map(h => (
                                            <th key={h} style={{ padding: '10px 12px', border: '1px solid #e5e7eb', fontWeight: '600', textAlign: 'center', whiteSpace: 'pre-line' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { zone: 'I',   month: '5.310.000', hour: '25.500' },
                                        { zone: 'II',  month: '4.730.000', hour: '22.700' },
                                        { zone: 'III', month: '4.140.000', hour: '20.000' },
                                        { zone: 'IV',  month: '3.700.000', hour: '17.800' },
                                    ].map(r => (
                                        <tr key={r.zone}>
                                            <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', textAlign: 'center', color: r.zone === 'II' ? GREEN : '#374151' }}>{r.zone}</td>
                                            <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{r.month}</td>
                                            <td style={{ padding: '10px 12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>{r.hour}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>Thời gian được hưởng bảo hiểm thất nghiệp</h4>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '8px' }}>Thời gian được hưởng BHTN như sau:</p>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '12px' }}>
                            <li>Đối với người đóng đủ 12 tháng đến 36 tháng được hưởng 03 tháng trợ cấp;</li>
                            <li>Sau 36 tháng, mỗi 12 tháng tham gia đủ BHTN sẽ được hưởng thêm 01 tháng trợ cấp, số tháng được hưởng trợ cấp thất nghiệp không quá 12 tháng;</li>
                            <li>Thời điểm để được hưởng trợ cấp tính từ ngày thứ 16 sau khi nộp đủ hồ sơ xin hưởng trợ cấp thất nghiệp;</li>
                        </ul>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '8px' }}>Với các khoản hỗ trợ khác sẽ được tính như sau:</p>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '16px' }}>
                            <li>Hỗ trợ tư vấn và giới thiệu việc làm: Miễn phí;</li>
                            <li>Hỗ trợ học nghề: Thời gian hỗ trợ không quá 06 tháng, tối đa được hỗ trợ 1.000.000 đồng/tháng/người.</li>
                        </ul>

                        {/* Examples */}
                        {[
                            {
                                title: 'Ví dụ 1:',
                                body: 'Chị An đóng bảo hiểm thất nghiệp được 62 tháng khi làm việc tại doanh nghiệp tư nhân ở vùng I với mức lương trung bình 06 tháng cuối cùng là 6.000.000 đồng/tháng. Thời gian được hưởng trợ cấp thất nghiệp của chị An được tính như sau:',
                                bullets: [
                                    '36 tháng đầu tiên: Hưởng 03 tháng trợ cấp;',
                                    '24 tháng tiếp theo: Hưởng 02 tháng trợ cấp;',
                                    '2 tháng còn lại: Cộng dồn cho lần hưởng bảo hiểm thất nghiệp tiếp theo;',
                                    'Mức trợ cấp thất nghiệp tối đa tại vùng I = Lương tối thiểu vùng * 5 = 5.310.000 * 5 = 26.550.000 đồng/tháng;',
                                    'Trợ cấp thất nghiệp theo công thức = 6.000.000 * 60% = 3.600.000 đồng/tháng.',
                                ],
                                conclusion: 'Như vậy chị An được hưởng 05 tháng trợ cấp thất nghiệp với mức hưởng mỗi tháng là 3.600.000 đồng/tháng, tổng 05 tháng là 18.000.000 đồng.',
                            },
                            {
                                title: 'Ví dụ 2:',
                                body: 'Ông Lê đóng bảo hiểm thất nghiệp được 15 tháng khi làm việc tại doanh nghiệp tư nhân ở vùng II với mức lương trung bình 06 tháng cuối cùng là 45.000.000 đồng/tháng. Thời gian và công thức tính bảo hiểm thất nghiệp của ông Lê được tính như sau:',
                                bullets: [
                                    '15 tháng: Hưởng 03 tháng trợ cấp thất nghiệp;',
                                    'Mức hưởng trợ cấp thất nghiệp tối đa tại vùng II = Lương tối thiểu vùng * 5 = 4.730.000 * 5 = 23.650.000 đồng/tháng;',
                                    'Trợ cấp thất nghiệp theo công thức = 45.000.000 * 60% = 27.000.000 đồng/tháng.',
                                ],
                                conclusion: 'Vì không thể vượt quá mức hưởng trợ cấp thất nghiệp tối đa là 23.650.000 nên ông Lê được hưởng 23.650.000 đồng/tháng trong thời hạn 3 tháng.',
                            },
                        ].map((ex, i) => (
                            <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
                                <p style={{ fontWeight: '600', marginBottom: '8px' }}>{ex.title}</p>
                                <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '8px' }}>{ex.body}</p>
                                <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '8px' }}>
                                    {ex.bullets.map((b, j) => <li key={j}>{b}</li>)}
                                </ul>
                                <p style={{ color: '#374151', lineHeight: '1.75', fontStyle: 'italic' }}>{ex.conclusion}</p>
                            </div>
                        ))}

                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '8px' }}>
                            Để biết mức hưởng bảo hiểm thất nghiệp của mình là bao nhiêu, cách đơn giản nhất là các bạn có thể sử dụng công cụ tính bảo hiểm thất nghiệp mới nhất của TopCV. Bạn chỉ cần cung cấp các thông số:
                        </p>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '24px' }}>
                            <li>Bình quân tiền lương tháng đóng BHTN của 06 tháng liền kề trước khi thất nghiệp</li>
                            <li>Tổng thời gian đóng BHTN chưa hưởng (Thời gian đóng bảo hiểm thất nghiệp – Thời gian đã hưởng trợ cấp thất nghiệp)</li>
                            <li>Vùng (đối với doanh nghiệp)</li>
                        </ul>

                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Một số thông tin liên quan tới bảo hiểm thất nghiệp mới nhất bạn cần nắm rõ</h2>

                        <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Đối tượng được nhận bảo hiểm thất nghiệp</h4>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '8px' }}>Các đối tượng sau đây sẽ được hưởng bảo hiểm, trợ cấp thất nghiệp:</p>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '16px' }}>
                            <li>Có hợp đồng lao động/hợp đồng làm việc được ký vô thời hạn, không xác định thời hạn;</li>
                            <li>Có hợp đồng lao động/hợp đồng làm việc được ký kết trong thời gian nhất định, có thời hạn;</li>
                            <li>Có hợp đồng lao động thời vụ hoặc đang thực làm một công việc nhất định có thời gian từ 03 – dưới 13 tháng;</li>
                            <li>Với trường hợp Người lao động thực hiện, ký kết nhiều hợp đồng lao động/hợp đồng làm việc thì Người lao động và người sử dụng sẽ được tính trợ cấp thất nghiệp theo hợp đồng lao động được ký sớm nhất, có tham gia BHTN.</li>
                        </ul>

                        <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Điều kiện hưởng bảo hiểm thất nghiệp</h4>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '8px' }}>
                            Đối với BHTN, điều kiện để được hưởng trợ cấp thất nghiệp sẽ được quy định như sau:
                        </p>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '6px' }}>
                            * Người lao động đã chấm dứt hợp đồng lao động/hợp đồng làm việc. Một số trường hợp loại trừ không được hưởng BHTN bao gồm:
                        </p>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '8px' }}>
                            <li>NLĐ do đơn phương chấm dứt hợp đồng làm việc/hợp đồng lao động trái với quy định pháp luật;</li>
                            <li>NLĐ đang được hưởng lương hưu hoặc trợ cấp mất sức lao động.</li>
                        </ul>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '6px' }}>* Đối với Người lao động đã đóng đủ BHTN:</p>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '8px' }}>
                            <li>NLĐ đã đóng BHTN từ 12 – 24 tháng trước ngày kết thúc hợp đồng lao động có thời hạn hoặc không có thời hạn;</li>
                            <li>NLĐ đã đóng BHTN từ 12 – 36 tháng trước khi kết thúc hợp đồng lao động thời vụ hoặc có 01 công việc nhất định với thời hạn hợp đồng lao động/làm việc từ 03 – 12 tháng.</li>
                        </ul>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '16px' }}>
                            <li>* NLĐ đã đăng ký thất nghiệp, nộp đầy đủ hồ sơ theo quy định tại Trung tâm dịch vụ việc làm.</li>
                            <li>* NLĐ chưa tìm được việc sau 15 ngày, kể từ ngày nộp hồ sơ được nộp, trừ các trường hợp đặc biệt.</li>
                        </ul>

                        <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Hồ sơ hưởng bảo hiểm thất nghiệp</h4>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '8px' }}>
                            Theo Khoản 1, Điều 14, Nghị định số 374/2025/NĐ-CP quy định chi tiết một số điều của Luật Việc làm về bảo hiểm thất nghiệp, hồ sơ BHTN sẽ bao gồm các loại giấy tờ sau đây:
                        </p>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '16px' }}>
                            <li>Sổ bảo hiểm xã hội</li>
                            <li>Đơn đề nghị được hưởng trợ cấp thất nghiệp (theo mẫu quy định của Nhà nước)</li>
                            <li>Bản sao có chứng thực/bản chính một trong các giấy tờ sau:
                                <ul style={{ paddingLeft: '20px', lineHeight: '1.9' }}>
                                    <li>Hợp đồng lao động/hợp đồng làm việc đã hết hạn hoặc hoàn thành công việc;</li>
                                    <li>Giấy tờ xác nhận chấm dứt hợp đồng lao động hoặc công việc thời vụ (có thời hạn 03 – 12 tháng);</li>
                                    <li>Quyết định thôi việc; Quyết định kỷ luật buộc thôi việc; Quyết định sa thải;</li>
                                    <li>Thông báo/thỏa thuận chấm dứt hợp đồng lao động/hợp đồng làm việc.</li>
                                </ul>
                            </li>
                        </ul>

                        <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Thủ tục làm bảo hiểm thất nghiệp</h4>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '8px' }}>
                            Căn cứ theo Khoản 2, Điều 14, Nghị định số 374/2025/NĐ-CP, thủ tục hưởng bảo hiểm thất nghiệp sẽ bao gồm 4 bước sau đây:
                        </p>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '24px' }}>
                            <li><strong>Bước 1:</strong> Người lao động chưa có việc làm và có nhu cầu hưởng trợ cấp thất nghiệp sẽ nộp hồ sơ trực tiếp tại Trung tâm Giới thiệu việc làm tại địa phương sinh sống trong thời gian không quá 03 tháng kể từ ngày chấm dứt HĐLĐ.</li>
                            <li><strong>Bước 2:</strong> Giải quyết hồ sơ: Trong vòng 15 ngày làm việc kể từ ngày nộp hồ sơ; nếu trong vòng 20 ngày Trung tâm Giới thiệu việc làm ra quyết định duyệt chi trợ cấp thất nghiệp, người lao động cũng sẽ nhận được sổ từ BHXH xác nhận từ trung tâm.</li>
                            <li><strong>Bước 3:</strong> Người lao động nhận chi trả trợ cấp thất nghiệp: Trong vòng 05 ngày làm việc kể từ khi có quyết định chi trả trợ cấp thất nghiệp, cơ quan BHXH sẽ tiến hành chi trả trợ cấp thất nghiệp cho người lao động.</li>
                            <li><strong>Bước 4:</strong> Người lao động thông báo về trạng thái tìm việc: Hàng tháng, Người lao động cần tới Trung tâm dịch vụ việc làm để thông báo về tình hình tìm việc làm trong thời gian hưởng trợ cấp thất nghiệp.</li>
                        </ul>

                        {/* FAQ */}
                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>FAQ liên quan tới bảo hiểm thất nghiệp</h2>
                        {FAQS.map((faq, i) => (
                            <div key={i} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    style={{ width: '100%', textAlign: 'left', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', fontSize: '15px', gap: '12px' }}
                                >
                                    {faq.q}
                                    {openFaq === i ? <ChevronUp size={18} style={{ flexShrink: 0 }} /> : <ChevronDown size={18} style={{ flexShrink: 0 }} />}
                                </button>
                                {openFaq === i && (
                                    <div style={{ paddingBottom: '14px', color: '#374151', lineHeight: '1.75', fontSize: '14px' }}>{faq.a}</div>
                                )}
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: '20px' }} />

                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '20px' }}>
                            Trên đây là những chia sẻ của chúng tôi về thủ tục làm bảo hiểm thất nghiệp và công cụ tính bảo hiểm thất nghiệp. Hy vọng qua bài viết này bạn sẽ nắm được cách tính bảo hiểm thất nghiệp, từ đó đảm bảo quyền lợi của bản thân.
                        </p>

                        <div
                            style={{ borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <Image src={bannerImg} alt="Công cụ tính bảo hiểm thất nghiệp" style={{ width: '100%', height: 'auto' }} />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div>
                    <div style={{ background: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #00b14f 0%, #007a36 100%)', borderRadius: '8px', padding: '20px', color: 'white', textAlign: 'center' }}>
                            <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>ĐĂNG TIN MIỄN PHÍ</p>
                            <p style={{ fontSize: '13px', marginBottom: '12px' }}>& TÌM KIẾM ỨNG VIÊN</p>
                            <a href="/employer" style={{ display: 'inline-block', background: 'white', color: GREEN, fontWeight: '600', fontSize: '13px', padding: '8px 20px', borderRadius: '20px', textDecoration: 'none' }}>
                                Đăng tuyển ngay
                            </a>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#e5e7eb', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>B</span>
                            Bài viết liên quan
                        </h3>
                        {[
                            'Làm sao để nhận bảo hiểm thất nghiệp? Hướng dẫn quy trình chuẩn',
                            'Hướng dẫn xem lịch chuyển tiền bảo hiểm thất nghiệp chi tiết',
                            'Bảo hiểm thất nghiệp có được cộng dồn không?',
                            'Các trường hợp không được bảo lưu bảo hiểm thất nghiệp',
                            'Điều kiện hưởng bảo hiểm thất nghiệp mới nhất',
                            'Người lao động bị cho nghỉ việc có được hưởng bảo hiểm thất nghiệp không?',
                            '7 quy định hưởng bảo hiểm thất nghiệp mới nhất',
                            'Các loại bảo hiểm khi đi làm phải đóng: Cẩm nang giúp bạn "đọc vị" bảng lương chính xác',
                        ].map((a, i, arr) => (
                            <a key={i} href="#" style={{ display: 'block', color: '#374151', fontSize: '13px', padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none', textDecoration: 'none' }}
                               onMouseEnter={e => e.currentTarget.style.color = GREEN}
                               onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
                                {a}
                            </a>
                        ))}
                    </div>

                    <div style={{ background: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#e5e7eb', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>@</span>
                            Hỗ trợ
                        </h3>
                        <p style={{ fontSize: '13px', color: '#374151' }}>
                            Bạn có chia sẻ hay cần tư vấn về cách tính{' '}
                            <a href="#" style={{ color: GREEN }}>Bảo hiểm thất nghiệp?</a>
                        </p>
                        <p style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>
                            Hãy gửi email đề xuất tới{' '}
                            <a href="mailto:hotro@topcv.vn" style={{ color: GREEN }}>hotro@topcv.vn</a>.
                        </p>
                    </div>

                    {/* TopCV CV card */}
                    <div style={{ background: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                        <div style={{ border: `1px solid ${GREEN}`, borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                            <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>Tạo CV miễn phí và tìm công việc mơ ước với TopCV</p>
                            <ul style={{ textAlign: 'left', fontSize: '12px', color: '#374151', paddingLeft: '16px', marginBottom: '12px', lineHeight: '1.8' }}>
                                <li style={{ color: GREEN }}>50+ mẫu CV "cực đẹp", chỉnh sửa dễ dàng trong 5 phút.</li>
                                <li style={{ color: GREEN }}>Chuyên trang việc làm chất lượng cao</li>
                            </ul>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <a href="/tao-cv" style={{ background: GREEN, color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>Tạo CV</a>
                                <a href="/viec-lam" style={{ background: 'white', color: GREEN, padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', border: `1px solid ${GREEN}`, textDecoration: 'none' }}>Tìm việc ngay</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
