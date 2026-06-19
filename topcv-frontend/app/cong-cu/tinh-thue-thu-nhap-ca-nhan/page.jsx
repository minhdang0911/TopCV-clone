'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import bannerImg from '@/app/assests/img/cong-cu-thue-tncc.png';
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
        brackets: [
            { from: 0, to: 10e6, rate: 0.05, label: 'Đến 10 triệu VND' },
            { from: 10e6, to: 30e6, rate: 0.1, label: 'Trên 10 triệu đến 30 triệu VND' },
            { from: 30e6, to: 60e6, rate: 0.2, label: 'Trên 30 triệu đến 60 triệu VND' },
            { from: 60e6, to: 100e6, rate: 0.3, label: 'Trên 60 triệu đến 100 triệu VND' },
            { from: 100e6, to: Infinity, rate: 0.35, label: 'Trên 100 triệu VND' },
        ],
    },
    {
        id: 'nd128',
        label: 'Từ 01/07/2025 - 31/12/2025',
        badge: null,
        personalDeduction: 11_000_000,
        dependantDeduction: 4_400_000,
        minWage: { I: 5_060_000, II: 4_510_000, III: 3_940_000, IV: 3_530_000 },
        minWageDate: '01/07/2025',
        minWageDecree: 'NĐ 128/2025/NĐ-CP',
        brackets: [
            { from: 0, to: 5e6, rate: 0.05, label: 'Đến 5 triệu VND' },
            { from: 5e6, to: 10e6, rate: 0.1, label: 'Trên 5 triệu đến 10 triệu VND' },
            { from: 10e6, to: 18e6, rate: 0.15, label: 'Trên 10 triệu đến 18 triệu VND' },
            { from: 18e6, to: 32e6, rate: 0.2, label: 'Trên 18 triệu đến 32 triệu VND' },
            { from: 32e6, to: 52e6, rate: 0.25, label: 'Trên 32 triệu đến 52 triệu VND' },
            { from: 52e6, to: 80e6, rate: 0.3, label: 'Trên 52 triệu đến 80 triệu VND' },
            { from: 80e6, to: Infinity, rate: 0.35, label: 'Trên 80 triệu VND' },
        ],
    },
];

function calcTax(taxable, brackets) {
    if (taxable <= 0) return 0;
    let tax = 0;
    for (const { from, to, rate } of brackets) {
        if (taxable <= from) break;
        tax += (Math.min(taxable, to === Infinity ? taxable : to) - from) * rate;
    }
    return Math.round(tax);
}

function calcTNCN(gross, insBase, dependants, period) {
    const bhXH = Math.round(insBase * 0.08);
    const bhYT = Math.round(insBase * 0.015);
    const bhTN = Math.round(insBase * 0.01);
    const totalBH = bhXH + bhYT + bhTN;
    const incomeBeforeTax = gross - totalBH;
    const rawTaxable = incomeBeforeTax - period.personalDeduction - dependants * period.dependantDeduction;
    const taxableIncome = Math.max(0, rawTaxable);
    const tax = calcTax(taxableIncome, period.brackets);
    const net = incomeBeforeTax - tax;
    const bracketRows = period.brackets.map((b) => {
        const chiu = Math.max(0, Math.min(taxableIncome, b.to === Infinity ? taxableIncome : b.to) - b.from);
        return { label: b.label, rate: `${b.rate * 100}%`, chiu, tien: Math.round(chiu * b.rate) };
    });
    return { gross, insBase, bhXH, bhYT, bhTN, totalBH, incomeBeforeTax, taxableIncome, tax, net, bracketRows };
}

function fmt(n) {
    return Math.round(n).toLocaleString('vi-VN');
}
function parseInput(s) {
    return parseFloat((s || '').replace(/\./g, '').replace(/,/g, '.')) || 0;
}
function formatInput(val) {
    const num = val.replace(/[^0-9]/g, '');
    return num ? Number(num).toLocaleString('vi-VN') : '';
}

const FAQS = [
    {
        q: 'Thuế thu nhập cá nhân là gì?',
        a: 'Thuế thu nhập cá nhân (TNCN) là khoản tiền mà người có thu nhập phải trích từ lương và các nguồn thu khác (nếu có) để nộp vào ngân sách nhà nước sau khi đã được giảm trừ.',
    },
    {
        q: 'Ai phải đóng thuế thu nhập cá nhân?',
        a: 'Cá nhân cư trú có thu nhập từ tiền lương, tiền công chịu thuế TNCN từ 11 triệu đồng/tháng trở lên (sau khi giảm trừ gia cảnh bản thân) phải đóng thuế TNCN.',
    },
    {
        q: 'Công thức tính thuế thu nhập cá nhân như thế nào?',
        a: 'Thu nhập tính thuế = Thu nhập chịu thuế − Giảm trừ gia cảnh. Thuế TNCN = Thu nhập tính thuế × Thuế suất (theo biểu lũy tiến từng phần).',
    },
    {
        q: 'Mức giảm trừ gia cảnh mới nhất là bao nhiêu?',
        a: 'Từ 01/01/2026 (theo Luật Thuế TNCN số 109/2025/QH15): Người nộp thuế được giảm trừ 15,5 triệu đồng/tháng, mỗi người phụ thuộc được giảm trừ 6,2 triệu đồng/tháng.',
    },
    {
        q: 'Biểu thuế TNCN mới 5 bậc áp dụng từ khi nào?',
        a: 'Biểu thuế lũy tiến 5 bậc theo Luật Thuế TNCN 109/2025/QH15 áp dụng từ ngày 01/01/2026, thay thế biểu thuế 7 bậc cũ. Các bậc: 5% (đến 10M), 10% (10-30M), 20% (30-60M), 30% (60-100M), 35% (trên 100M).',
    },
    {
        q: 'Tiền làm thêm giờ có bị tính thuế TNCN không?',
        a: 'Theo quy định, thu nhập tiền lương làm việc ban đêm, làm thêm giờ, tiền lương trả cao hơn so với tiền lương, tiền công làm việc ban ngày, làm việc trong giờ theo quy định của pháp luật được miễn thuế TNCN (chỉ miễn phần thu nhập trả cao hơn).',
    },
];

const RELATED_ARTICLES = [
    'Áp dụng mức giảm trừ gia cảnh và biểu thuế TNCN mới từ 2026, hàng triệu người lao động hưởng lợi',
    'Những ai không phải đóng thuế thu nhập cá nhân 2026?',
    'Chi tiết về cách tính thuế TNCN theo lương Gross và lương Net',
    'Tăng thu nhập thực nhận bằng cách nằm rõ: Các khoản thu nhập không chịu thuế TNCN',
    'Phân biệt thu nhập chịu thuế và thu nhập tính thuế',
    'Tiền tăng ca có tính thuế TNCN không? Cách tính thuế TNCN đối với tiền tiền tăng ca',
    'Quyết toán thuế TNCN là gì? Lộ trình tự quyết toán chuẩn xác, không lo sai sót',
    'Trợ cấp thôi việc có tính thuế TNCN không? Cập nhật quy định mới nhất',
];

export default function TinhThueTNCNPage() {
    const calcRef = useRef(null);
    const [periodId, setPeriodId] = useState('nd293');
    const [grossInput, setGrossInput] = useState('');
    const [insMode, setInsMode] = useState('official');
    const [insInput, setInsInput] = useState('');
    const [region, setRegion] = useState('I');
    const [dependants, setDependants] = useState(0);
    const [result, setResult] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const period = PERIODS.find((p) => p.id === periodId);

    const handleCalc = () => {
        const gross = parseInput(grossInput);
        if (!gross || gross <= 0) return;
        const insBase = insMode === 'official' ? gross : parseInput(insInput);
        setResult(calcTNCN(gross, insBase, dependants, period));
        setTimeout(() => {
            document.getElementById('tncn-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
            <MinWageModal show={showModal} onClose={() => setShowModal(false)} period={period} periodId={periodId} />

            <style>{`
                @media (max-width: 768px) {
                    .tncn-layout { flex-direction: column !important; }
                    .tncn-sidebar { width: 100% !important; }
                }
            `}</style>
            <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '32px 16px' }}>
                <div className="tncn-layout" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    {/* ── Left ── */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1
                            ref={calcRef}
                            style={{
                                fontSize: '22px',
                                fontWeight: '800',
                                color: '#111827',
                                marginBottom: '20px',
                                lineHeight: 1.3,
                            }}
                        >
                            Công cụ tính Thuế thu nhập cá nhân chuẩn 2026
                        </h1>

                        {/* Period toggle */}
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                alignItems: 'center',
                                marginBottom: '12px',
                            }}
                        >
                            <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                                Áp dụng quy định:
                            </span>
                            {PERIODS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setPeriodId(p.id);
                                        setResult(null);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        border: `1.5px solid ${periodId === p.id ? '#00b14f' : '#d1d5db'}`,
                                        background: periodId === p.id ? '#00b14f' : 'white',
                                        color: periodId === p.id ? 'white' : '#374151',
                                    }}
                                >
                                    {p.label}
                                    {p.badge && (
                                        <span
                                            style={{
                                                background: '#fef3c7',
                                                color: '#92400e',
                                                fontSize: '10px',
                                                padding: '1px 5px',
                                                borderRadius: '8px',
                                                fontWeight: '700',
                                            }}
                                        >
                                            {p.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Info text */}
                        <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.9, marginBottom: '16px' }}>
                            <p style={{ margin: '0 0 4px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{ color: '#00b14f', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>
                                    ●
                                </span>
                                Áp dụng lương cơ sở mới nhất có hiệu lực từ ngày 01/07/2024 (Theo Nghị định số
                                73/2024/NĐ-CP)
                            </p>
                            <p style={{ margin: '0 0 4px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{ color: '#00b14f', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>
                                    ●
                                </span>
                                <span>
                                    Áp dụng{' '}
                                    <button
                                        onClick={() => setShowModal(true)}
                                        style={{
                                            color: '#dc2626',
                                            fontWeight: '600',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            padding: 0,
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        mức lương tối thiểu vùng
                                    </button>{' '}
                                    mới nhất có hiệu lực từ ngày {period.minWageDate} (Theo Nghị định{' '}
                                    {period.minWageDecree})
                                </span>
                            </p>
                            <p style={{ margin: '0 0 4px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{ color: '#00b14f', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>
                                    ●
                                </span>
                                Áp dụng mức giảm trừ gia cảnh mới nhất{' '}
                                <strong>{fmt(period.personalDeduction)} đồng/tháng</strong> (
                                {fmt(period.personalDeduction * 12)} đồng/năm) với người nộp thuế và{' '}
                                <strong>{fmt(period.dependantDeduction)} đồng/tháng</strong> với mỗi người phụ thuộc
                                {periodId === 'nd128' && ' (Theo Nghị Quyết số 954/2020/UBTVQH14)'}
                            </p>
                        </div>

                        {/* Info cards */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                marginBottom: '20px',
                            }}
                        >
                            <div
                                style={{
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '12px 14px',
                                }}
                            >
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                    Giảm trừ gia cảnh bản thân
                                </div>
                                <div style={{ fontSize: '17px', fontWeight: '700', color: '#00b14f' }}>
                                    {fmt(period.personalDeduction)}đ
                                </div>
                            </div>
                            <div
                                style={{
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '12px 14px',
                                }}
                            >
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                    Người phụ thuộc
                                </div>
                                <div style={{ fontSize: '17px', fontWeight: '700', color: '#00b14f' }}>
                                    {fmt(period.dependantDeduction)}đ
                                </div>
                            </div>
                        </div>

                        {/* Calculator card */}
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '24px',
                                border: '1px solid #e5e7eb',
                                marginBottom: '24px',
                            }}
                        >
                            {/* Gross input */}
                            <div style={{ marginBottom: '20px' }}>
                                <label
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        display: 'block',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Thu Nhập (Gross)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                            fontSize: '15px',
                                        }}
                                    >
                                        $
                                    </span>
                                    <input
                                        type="text"
                                        value={grossInput}
                                        onChange={(e) => setGrossInput(formatInput(e.target.value))}
                                        placeholder="VD: 10,000,000"
                                        style={{
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            padding: '10px 56px 10px 32px',
                                            border: '1.5px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            outline: 'none',
                                        }}
                                    />
                                    <span
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                            fontSize: '12px',
                                        }}
                                    >
                                        VNĐ
                                    </span>
                                </div>
                            </div>

                            {/* Insurance basis */}
                            <div style={{ marginBottom: '20px' }}>
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Mức lương đóng bảo hiểm
                                </div>
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#374151',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="insMode"
                                        value="official"
                                        checked={insMode === 'official'}
                                        onChange={() => setInsMode('official')}
                                        style={{ accentColor: '#00b14f' }}
                                    />
                                    Trên lương chính thức
                                </label>
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#374151',
                                        marginBottom: insMode === 'other' ? '8px' : 0,
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="insMode"
                                        value="other"
                                        checked={insMode === 'other'}
                                        onChange={() => setInsMode('other')}
                                        style={{ accentColor: '#00b14f' }}
                                    />
                                    Khác
                                </label>
                                {insMode === 'other' && (
                                    <div style={{ position: 'relative', marginLeft: '24px' }}>
                                        <span
                                            style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9ca3af',
                                                fontSize: '15px',
                                            }}
                                        >
                                            $
                                        </span>
                                        <input
                                            type="text"
                                            value={insInput}
                                            onChange={(e) => setInsInput(formatInput(e.target.value))}
                                            placeholder="Nhập mức lương đóng BH..."
                                            style={{
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                padding: '10px 56px 10px 32px',
                                                border: '1.5px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                outline: 'none',
                                            }}
                                        />
                                        <span
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9ca3af',
                                                fontSize: '12px',
                                            }}
                                        >
                                            VNĐ
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Region */}
                            <div style={{ marginBottom: '20px' }}>
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    Vùng:
                                    <button
                                        onClick={() => setShowModal(true)}
                                        style={{
                                            fontSize: '12px',
                                            color: '#dc2626',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontWeight: '500',
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        (Giải thích)
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '28px' }}>
                                    {['I', 'II', 'III', 'IV'].map((r) => (
                                        <label
                                            key={r}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#374151',
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="region"
                                                value={r}
                                                checked={region === r}
                                                onChange={() => setRegion(r)}
                                                style={{ accentColor: '#00b14f' }}
                                            />
                                            {r}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Dependants */}
                            <div style={{ marginBottom: '20px' }}>
                                <label
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        display: 'block',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Số người phụ thuộc
                                </label>
                                <div
                                    style={{
                                        position: 'relative',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        border: '1.5px solid #d1d5db',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        width: '200px',
                                    }}
                                >
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '10px',
                                            color: '#9ca3af',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={dependants}
                                        onChange={(e) => setDependants(Math.max(0, parseInt(e.target.value) || 0))}
                                        style={{
                                            width: '100%',
                                            padding: '10px 56px 10px 34px',
                                            border: 'none',
                                            fontSize: '15px',
                                            outline: 'none',
                                        }}
                                    />
                                    <span
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            color: '#9ca3af',
                                            fontSize: '12px',
                                        }}
                                    >
                                        Người
                                    </span>
                                </div>
                            </div>

                            {/* Submit button */}
                            <button
                                onClick={handleCalc}
                                style={{
                                    padding: '13px 40px',
                                    background: '#00b14f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                Tính thuế TNCN
                            </button>
                        </div>

                        {/* Results */}
                        {result && (
                            <div
                                id="tncn-result"
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    border: '1px solid #e5e7eb',
                                    marginBottom: '24px',
                                }}
                            >
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <tbody>
                                        {[
                                            { label: 'Lương GROSS', value: result.gross, bold: true, bg: '#f9fafb' },
                                            { label: 'Bảo hiểm xã hội (8%)', value: result.bhXH },
                                            { label: 'Bảo hiểm y tế (1.5%)', value: result.bhYT },
                                            { label: 'Bảo hiểm thất nghiệp (1%)', value: result.bhTN },
                                            {
                                                label: 'Thu nhập trước thuế',
                                                value: result.incomeBeforeTax,
                                                bold: true,
                                                bg: '#f9fafb',
                                            },
                                            {
                                                label: 'Giảm trừ gia cảnh bản thân',
                                                value: result.gross > 0 ? period.personalDeduction : 0,
                                            },
                                            {
                                                label: 'Giảm trừ gia cảnh người phụ thuộc',
                                                value: dependants * period.dependantDeduction,
                                            },
                                            {
                                                label: 'Thu nhập chịu thuế',
                                                value: result.taxableIncome,
                                                bold: true,
                                                bg: '#f9fafb',
                                            },
                                            {
                                                label: 'Thuế thu nhập cá nhân (*)',
                                                value: result.tax,
                                                bold: true,
                                                color: result.tax > 0 ? '#dc2626' : undefined,
                                            },
                                        ].map(({ label, value, bold, bg, color }) => (
                                            <tr
                                                key={label}
                                                style={{ background: bg || 'white', borderBottom: '1px solid #f3f4f6' }}
                                            >
                                                <td
                                                    style={{
                                                        padding: '10px 16px',
                                                        color: '#374151',
                                                        fontWeight: bold ? '600' : '400',
                                                    }}
                                                >
                                                    {label}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '10px 16px',
                                                        textAlign: 'right',
                                                        fontWeight: bold ? '700' : '500',
                                                        color: color || '#111827',
                                                    }}
                                                >
                                                    {fmt(value)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Bracket breakdown */}
                                <div style={{ marginTop: '16px' }}>
                                    <p
                                        style={{
                                            fontSize: '13px',
                                            color: '#00b14f',
                                            fontWeight: '600',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        (*) Chi tiết thuế thu nhập cá nhân (VNĐ)
                                    </p>
                                    <table
                                        style={{
                                            width: '100%',
                                            borderCollapse: 'collapse',
                                            fontSize: '13px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <thead>
                                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                                <th
                                                    style={{
                                                        padding: '10px 12px',
                                                        textAlign: 'left',
                                                        color: '#374151',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    Mức chịu thuế
                                                </th>
                                                <th
                                                    style={{
                                                        padding: '10px 12px',
                                                        textAlign: 'center',
                                                        color: '#374151',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    Thuế suất
                                                </th>
                                                <th
                                                    style={{
                                                        padding: '10px 12px',
                                                        textAlign: 'right',
                                                        color: '#374151',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    Lương chịu thuế
                                                </th>
                                                <th
                                                    style={{
                                                        padding: '10px 12px',
                                                        textAlign: 'right',
                                                        color: '#374151',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    Tiền nộp
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.bracketRows.map((row, i) => (
                                                <tr
                                                    key={i}
                                                    style={{
                                                        borderBottom: '1px solid #f3f4f6',
                                                        background: i % 2 === 0 ? 'white' : '#fafafa',
                                                    }}
                                                >
                                                    <td style={{ padding: '9px 12px', color: '#374151' }}>
                                                        {row.label}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: '9px 12px',
                                                            textAlign: 'center',
                                                            color: '#374151',
                                                        }}
                                                    >
                                                        {row.rate}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: '9px 12px',
                                                            textAlign: 'right',
                                                            color: '#374151',
                                                        }}
                                                    >
                                                        {fmt(row.chiu)}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: '9px 12px',
                                                            textAlign: 'right',
                                                            fontWeight: row.tien > 0 ? '600' : '400',
                                                            color: row.tien > 0 ? '#dc2626' : '#374151',
                                                        }}
                                                    >
                                                        {fmt(row.tien)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Article content */}
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '28px 32px',
                                border: '1px solid #e5e7eb',
                                marginBottom: '24px',
                                lineHeight: 1.8,
                                color: '#374151',
                                fontSize: '14px',
                            }}
                        >
                            <p style={{ margin: '0 0 16px' }}>
                                Thuế thu nhập cá nhân là gì? Tại sao cần đóng thuế thu nhập cá nhân? Công thức tính thuế
                                thu nhập cá nhân như thế nào?{' '}
                                <span style={{ color: '#00b14f', fontWeight: '600' }}>TopCV</span> sẽ giải đáp những
                                thắc mắc liên quan tới thuế thu nhập cá nhân bạn cần nắm rõ.
                            </p>

                            <h2
                                style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '24px 0 12px' }}
                            >
                                Thuế thu nhập cá nhân là gì?
                            </h2>
                            <p style={{ margin: '0 0 12px' }}>
                                <strong style={{ color: '#00b14f' }}>Thuế thu nhập cá nhân</strong> (Tiếng Anh: Personal
                                income tax) là khoản tiền mà người có thu nhập cần trích từ lương và các nguồn thu khác
                                (nếu có) của mình để nộp vào ngân sách nhà nước sau khi đã được giảm trừ.
                            </p>
                            <p style={{ margin: '0 0 16px' }}>
                                Thuế thu nhập cá nhân không đánh vào tất cả các đối tượng mà có mức lương quy định cần
                                đóng riêng, góp phần thu hẹp khoảng cách giữa các tầng lớp trong xã hội.
                            </p>

                            <h2
                                style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '24px 0 12px' }}
                            >
                                Công cụ tính thuế thu nhập cá nhân mới nhất 2026
                            </h2>
                            <p style={{ margin: '0 0 12px' }}>
                                Trước khi tính thuế thu nhập cá nhân chúng ta cần xác định đối tượng cần đóng thuế thu
                                nhập cá nhân. Đối tượng cần đóng thuế thu nhập cá nhân chia ra hai đối tượng chính là cá
                                nhân cư trú và cá nhân không cư trú.
                            </p>

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '20px 0 8px' }}>
                                Cá nhân cư trú
                            </h3>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '12px 0 8px' }}>
                                Cá nhân cư trú là gì?
                            </h4>
                            <p style={{ margin: '0 0 12px' }}>
                                Khoản 2, Điều 2, <strong>Luật Thuế thu nhập cá nhân 2025</strong> số 109/2025/QH15 quy
                                định, cá nhân cư trú là người đáp ứng một trong các điều kiện sau đây:
                            </p>
                            <p style={{ margin: '0 0 8px' }}>
                                a) Có mặt tại Việt Nam từ 183 ngày trở lên tính trong 01 năm dương lịch hoặc tính theo
                                12 tháng liên tục kể từ ngày đầu tiên có mặt tại Việt Nam;
                            </p>
                            <p style={{ margin: '0 0 16px' }}>
                                b) Có nơi ở thường xuyên tại Việt Nam, bao gồm có nơi ở đăng ký thường trú hoặc có nhà
                                thuê để ở tại Việt Nam theo hợp đồng thuê có thời hạn.
                            </p>

                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '16px 0 8px' }}>
                                Công thức tính thuế thu nhập cá nhân mới nhất 2026
                            </h4>
                            <p style={{ margin: '0 0 8px' }}>
                                Vậy tính thuế thu nhập cá nhân tính như thế nào? Hãy cùng tham khảo những thông tin dưới
                                đây để có thể tính mức thuế thu nhập cá nhân chính xác.
                            </p>

                            <p style={{ fontWeight: '600', margin: '12px 0 8px' }}>
                                A. Đối với cá nhân ký hợp đồng lao động từ 03 tháng trở lên:
                            </p>
                            <div
                                style={{
                                    background: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    padding: '12px 16px',
                                    textAlign: 'center',
                                    margin: '8px 0 12px',
                                    fontWeight: '600',
                                }}
                            >
                                Thuế thu nhập cá nhân phải nộp = Thu nhập tính thuế × Thuế suất
                            </div>

                            <p style={{ fontWeight: '600', margin: '12px 0 6px' }}>* Diễn giải công thức:</p>
                            <ul style={{ margin: '0 0 12px', paddingLeft: '20px', lineHeight: 2 }}>
                                <li>Thu nhập tính thuế = Thu nhập chịu thuế − Các khoản giảm trừ</li>
                                <li>
                                    Thu nhập chịu thuế TNCN = Tổng thu nhập − Các khoản thu nhập được miễn thuế TNCN
                                </li>
                            </ul>

                            <p style={{ fontWeight: '600', margin: '12px 0 6px' }}>* Mức giảm trừ gia cảnh:</p>
                            <p style={{ margin: '0 0 6px' }}>
                                Theo Khoản 1, Điều 10, Luật Thuế thu nhập cá nhân số 109/2025/QH15, mức giảm trừ gia
                                cảnh được quy định như sau:
                            </p>
                            <ul style={{ margin: '0 0 12px', paddingLeft: '20px', lineHeight: 2 }}>
                                <li>
                                    Đối với người nộp thuế: Mức giảm trừ gia cảnh là{' '}
                                    <strong>15,5 triệu đồng/tháng</strong> (186 triệu đồng/năm).
                                </li>
                                <li>
                                    Đối với người phụ thuộc: Mức giảm trừ gia cảnh là{' '}
                                    <strong>6,2 triệu đồng/tháng</strong>.
                                </li>
                            </ul>

                            <p style={{ fontWeight: '600', margin: '12px 0 6px' }}>* Thuế suất:</p>
                            <p style={{ margin: '0 0 8px' }}>
                                Theo Khoản 2, Điều 9, Luật thuế thu nhập cá nhân 2025, số 109/2025/QH15, Biểu thuế lũy
                                tiến từng phần được quy định như sau:
                            </p>
                            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '13px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                >
                                    <thead>
                                        <tr style={{ background: '#f9fafb' }}>
                                            <th
                                                style={{
                                                    padding: '10px',
                                                    border: '1px solid #e5e7eb',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                Bậc
                                            </th>
                                            <th
                                                style={{
                                                    padding: '10px',
                                                    border: '1px solid #e5e7eb',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                Phần thu nhập tính thuế/năm (triệu đồng)
                                            </th>
                                            <th
                                                style={{
                                                    padding: '10px',
                                                    border: '1px solid #e5e7eb',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                Phần thu nhập tính thuế/tháng (triệu đồng)
                                            </th>
                                            <th
                                                style={{
                                                    padding: '10px',
                                                    border: '1px solid #e5e7eb',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                Thuế suất (%)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            [1, 'Đến 120', 'Đến 10', 5],
                                            [2, 'Trên 120 đến 360', 'Trên 10 đến 30', 10],
                                            [3, 'Trên 360 đến 720', 'Trên 30 đến 60', 20],
                                            [4, 'Trên 720 đến 1.200', 'Trên 60 đến 100', 30],
                                            [5, 'Trên 1.200', 'Trên 100', 35],
                                        ].map(([bac, nam, thang, ts]) => (
                                            <tr key={bac} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td
                                                    style={{
                                                        padding: '9px',
                                                        border: '1px solid #e5e7eb',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {bac}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '9px',
                                                        border: '1px solid #e5e7eb',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {nam}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '9px',
                                                        border: '1px solid #e5e7eb',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {thang}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '9px',
                                                        border: '1px solid #e5e7eb',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {ts}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p
                                style={{
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    textAlign: 'center',
                                    margin: '0 0 16px',
                                    fontStyle: 'italic',
                                }}
                            >
                                Biểu thuế TNCN lũy tiến 5 bậc theo quy định mới áp dụng từ 01/01/2026
                            </p>

                            <p style={{ margin: '0 0 8px' }}>
                                Tại Kỳ họp thứ 10, Quốc hội khóa XV, sáng 10/12/2025, Quốc hội đã ban hành Luật Thuế thu
                                nhập cá nhân 2025. Theo đó, Quốc hội chốt phương án sửa đổi biểu thuế thu nhập cá nhân
                                từ 7 xuống 5 bậc, đồng thời nới rộng khoảng cách giữa các bậc, mức thuế cao nhất vẫn giữ
                                35%.
                            </p>

                            <div
                                style={{
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '6px',
                                    padding: '12px 16px',
                                    margin: '12px 0 16px',
                                    fontSize: '13px',
                                }}
                            >
                                Theo Luật Thuế thu nhập cá nhân, các quy định liên quan đến thu nhập từ kinh doanh, tiền
                                lương và tiền công của cá nhân cư trú sẽ được áp dụng ngay từ kỳ tính thuế năm 2026, tức
                                là từ ngày 01/01/2026.
                            </div>

                            <p style={{ fontWeight: '600', margin: '16px 0 8px' }}>
                                B. Đối với cá nhân không ký hợp đồng lao động hoặc hợp đồng lao động dưới 3 tháng
                            </p>
                            <p style={{ margin: '0 0 8px' }}>
                                Công thức thuế thu nhập cá nhân đối với cá nhân không ký hợp đồng lao động hoặc hợp đồng
                                lao động dưới 3 tháng như sau:
                            </p>
                            <div
                                style={{
                                    background: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    padding: '12px 16px',
                                    textAlign: 'center',
                                    margin: '8px 0 16px',
                                    fontWeight: '600',
                                }}
                            >
                                Thuế thu nhập cá nhân phải nộp = 10% × Tổng thu nhập trước khi trả
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '24px 0 8px' }}>
                                Cá nhân không cư trú
                            </h3>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '12px 0 8px' }}>
                                Cá nhân không cư trú là gì?
                            </h4>
                            <p style={{ margin: '0 0 12px' }}>
                                Cá nhân không cư trú được xác định là người nước ngoài không đáp ứng đủ điều kiện của cá
                                nhân cư trú được quy định tại Khoản 3, Điều 2 Luật Thuế thu nhập cá nhân năm 2025.
                            </p>

                            <p style={{ fontWeight: '600', margin: '12px 0 6px' }}>
                                A. Công thức tính thuế thu nhập cá nhân của cá nhân không cư trú
                            </p>
                            <div
                                style={{
                                    background: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    padding: '12px 16px',
                                    textAlign: 'center',
                                    margin: '8px 0 12px',
                                    fontWeight: '600',
                                }}
                            >
                                Thuế TNCN phải nộp = Thu nhập chịu thuế TNCN × Thuế suất 20%
                            </div>

                            <h2
                                style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '28px 0 12px' }}
                            >
                                Những quy định đóng thuế thu nhập cá nhân khác
                            </h2>

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '20px 0 8px' }}>
                                Đâu là những khoản phụ cấp, trợ cấp không tính thuế thu nhập cá nhân?
                            </h3>
                            <p style={{ margin: '0 0 8px' }}>
                                Theo quy định tại Điểm c, Khoản 2, Điều 3 Luật Thuế thu nhập cá nhân số 109/2025/QH15,
                                các khoản phụ cấp và trợ cấp sau không phải tính thuế thu nhập cá nhân:
                            </p>
                            <ul style={{ margin: '0 0 16px', paddingLeft: '20px', lineHeight: 2 }}>
                                <li>
                                    Trợ cấp, phụ cấp ưu đãi hàng tháng và trợ cấp một lần theo quy định của pháp luật về
                                    ưu đãi người có công.
                                </li>
                                <li>
                                    Trợ cấp hàng tháng, trợ cấp một lần đối với các đối tượng tham gia kháng chiến, bảo
                                    vệ tổ quốc, làm nhiệm vụ quốc tế.
                                </li>
                                <li>Phụ cấp quốc phòng, an ninh; các khoản trợ cấp đối với lực lượng vũ trang.</li>
                                <li>
                                    Phụ cấp độc hại, nguy hiểm đối với những ngành, nghề hoặc công việc ở nơi làm việc
                                    có yếu tố độc hại, nguy hiểm.
                                </li>
                                <li>Phụ cấp thu hút, phụ cấp khu vực.</li>
                                <li>
                                    Trợ cấp khó khăn đột xuất, trợ cấp tại nạn lao động, bệnh nghề nghiệp, trợ cấp một
                                    lần khi sinh con hoặc nhận con nuôi...
                                </li>
                                <li>Phụ cấp đối với nhân viên y tế thôn, bản.</li>
                                <li>Phụ cấp đặc thù ngành nghề.</li>
                            </ul>

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '20px 0 8px' }}>
                                Thử việc có cần đóng thuế thu nhập cá nhân hay không?
                            </h3>
                            <p style={{ margin: '0 0 8px' }}>
                                Theo Khoản 2, Điều 3 Luật Thuế thu nhập cá nhân, tiền lương, tiền công và các khoản có
                                tính chất tiền lương, tiền công được xem là thu nhập chịu thuế thu nhập cá nhân.
                            </p>
                            <p style={{ margin: '0 0 8px' }}>
                                Căn cứ Thông tư 111/2013/TT-BTC của Bộ Tài Chính hướng dẫn thực hiện Luật Thuế thu nhập
                                cá nhân, các trường hợp không ký hợp đồng lao động hoặc ký hợp đồng lao động dưới 03
                                tháng và có tổng mức thu nhập từ hai triệu (2.000.000) đồng/lần trở lên thì phải khấu
                                trừ thuế theo mức 10% trên tổng thu nhập.
                            </p>

                            <p style={{ fontWeight: '600', margin: '12px 0 6px' }}>Ví dụ:</p>
                            <div
                                style={{
                                    background: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    padding: '12px 16px',
                                    margin: '0 0 16px',
                                    fontSize: '13px',
                                    fontStyle: 'italic',
                                }}
                            >
                                Lương của nhân viên thử việc hưởng 100% mức lương chính thức là 20.000.000 đồng sẽ bị
                                khấu trừ 2.000.000 đồng → Lương thực nhận là 18.000.000 đồng.
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '20px 0 8px' }}>
                                Tiền tăng ca, tiền làm thêm giờ có bị áp thuế thu nhập cá nhân không?
                            </h3>
                            <p style={{ margin: '0 0 8px' }}>
                                Chiều theo quy định tại Khoản 8, Điều 4 Luật Thuế thu nhập cá nhân, thu nhập tiền lương
                                làm việc ban đêm, làm thêm giờ, tiền lương, tiền công trả cho những ngày không nghỉ phép
                                theo quy định của pháp luật được miễn thuế thu nhập cá nhân.
                            </p>
                            <p style={{ margin: '0 0 16px' }}>
                                Tuy nhiên phần tiền này không được miễn toàn bộ mà chỉ được miễn phần thu nhập được trả
                                cao hơn so với tiền lương, tiền công làm việc trong giờ theo quy định.
                            </p>

                            <p style={{ margin: '0 0 8px' }}>
                                Trên đây là những chia sẻ của chúng tôi về thuế thu nhập cá nhân và{' '}
                                <strong style={{ color: '#00b14f' }}>
                                    công cụ tính thuế thu nhập cá nhân mới nhất
                                </strong>
                                . Hy vọng qua bài viết này bạn sẽ nắm được cách tính thuế thu nhập cá nhân, từ đó đảm
                                bảo quyền lợi của bản thân.
                            </p>
                        </div>

                        {/* Banner */}
                        <div
                            style={{
                                width: '100%',
                                cursor: 'pointer',
                                marginBottom: '24px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                            }}
                            onClick={() => calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        >
                            <Image
                                src={bannerImg}
                                alt="Công cụ tính thuế thu nhập cá nhân - TopCV"
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>

                        {/* FAQ */}
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                overflow: 'hidden',
                                marginBottom: '24px',
                            }}
                        >
                            {FAQS.map((faq, i) => (
                                <div
                                    key={i}
                                    style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '16px 20px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '12px',
                                        }}
                                    >
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                                            {faq.q}
                                        </span>
                                        <span style={{ color: '#6b7280', fontSize: '18px', flexShrink: 0 }}>
                                            {openFaq === i ? '−' : '+'}
                                        </span>
                                    </button>
                                    {openFaq === i && (
                                        <div
                                            style={{
                                                padding: '0 20px 16px',
                                                fontSize: '14px',
                                                color: '#374151',
                                                lineHeight: 1.7,
                                            }}
                                        >
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Right sidebar ── */}
                    <div className="tncn-sidebar" style={{ width: '300px', flexShrink: 0 }}>
                        {/* Related articles */}
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                padding: '20px',
                                marginBottom: '16px',
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: '#111827',
                                    margin: '0 0 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '4px',
                                        height: '16px',
                                        background: '#00b14f',
                                        borderRadius: '2px',
                                    }}
                                />
                                Bài viết liên quan
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {RELATED_ARTICLES.map((title, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        style={{
                                            fontSize: '13px',
                                            color: '#374151',
                                            textDecoration: 'none',
                                            lineHeight: 1.5,
                                            borderBottom:
                                                i < RELATED_ARTICLES.length - 1 ? '1px solid #f3f4f6' : 'none',
                                            paddingBottom: i < RELATED_ARTICLES.length - 1 ? '12px' : 0,
                                        }}
                                    >
                                        {title}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Support box */}
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                padding: '20px',
                                marginBottom: '16px',
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: '#111827',
                                    margin: '0 0 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '4px',
                                        height: '16px',
                                        background: '#00b14f',
                                        borderRadius: '2px',
                                    }}
                                />
                                Hỗ trợ
                            </h3>
                            <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 8px' }}>
                                Bạn có câu hỏi hay cần tư vấn về cách tính{' '}
                                <a href="#" style={{ color: '#00b14f' }}>
                                    lãi suất kép?
                                </a>
                            </p>
                            <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>
                                Hãy gửi email để xuất tới{' '}
                                <a href="mailto:hotro@topcv.vn" style={{ color: '#00b14f' }}>
                                    hotro@topcv.vn
                                </a>
                            </p>
                        </div>

                        {/* CTA card */}
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                padding: '20px',
                            }}
                        >
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px' }}>
                                Tạo CV miễn phí và tìm công việc mơ ước với TopCV
                            </p>
                            <ul
                                style={{
                                    margin: '0 0 16px',
                                    paddingLeft: '20px',
                                    fontSize: '13px',
                                    color: '#374151',
                                    lineHeight: 1.8,
                                }}
                            >
                                <li>50+ mẫu CV "cực đẹp", chỉnh sửa dễ dàng trong 5 phút.</li>
                                <li>Chuyên trang việc làm chất lượng cao</li>
                            </ul>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <a
                                    href="/tao-cv"
                                    style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        padding: '9px',
                                        background: '#00b14f',
                                        color: 'white',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Tạo CV
                                </a>
                                <a
                                    href="/viec-lam"
                                    style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        padding: '9px',
                                        background: 'white',
                                        color: '#374151',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                    }}
                                >
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
