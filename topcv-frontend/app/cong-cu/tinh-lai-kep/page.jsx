'use client';
import { useState } from 'react';
import Image from 'next/image';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import bannerImg from '@/app/assests/img/TInh Lãi suất kép6981bea31ef64.jpg';

const GREEN = '#00b14f';

const FREQ_OPTIONS = [
    { key: 'annual',    label: 'Hàng năm',   m: 1 },
    { key: 'quarterly', label: 'Hàng quý',   m: 4 },
    { key: 'monthly',   label: 'Hàng tháng', m: 12 },
    { key: 'daily',     label: 'Hàng ngày',  m: 365 },
];

const FAQS = [
    {
        q: 'Mức lãi suất là bao nhiêu?',
        a: 'Lãi suất là tỷ lệ mà số tiền đầu được người vay trả cho việc sử dụng tiền mà họ vay từ người cho vay. Tùy vào chính sách của mỗi ngân hàng hay đơn vị/tổ chức tài chính sẽ có mức lãi suất khác nhau. Nếu bạn gửi tiết kiệm – tức là bạn đang cho ngân hàng vay tạm thì lãi suất càng cao càng có lợi cho bạn. Tham khảo càng nhiều ngân hàng hay gói tiết kiệm / đầu tư để lựa chọn được nơi gửi tiết kiệm / đầu tư hiệu quả nhất.',
    },
    {
        q: 'Lãi suất hàng năm, hàng tháng là gì?',
        a: 'Với dịch vụ gửi tiết kiệm có kỳ hạn, số tiền gửi sẽ được quy định một mức kỳ hạn đi kèm với mức lãi suất cam kết. Ngân hàng sẽ đưa ra nhiều mức kỳ hạn khác nhau cho khách hàng lựa chọn theo nhu cầu, ví dụ gửi tiết kiệm hàng tháng, quý, năm,... Công cụ tính lãi kép của TopCV bao gồm 2 tuỳ chọn vì lãi kép phổ biến nhất đó là theo năm và theo tháng.',
    },
    {
        q: 'Làm thế nào để tận dụng được sức mạnh của lãi kép?',
        a: null,
        subItems: [
            {
                title: 'Hãy bắt đầu tiết kiệm/đầu tư từ sớm',
                body: 'Dù bạn bao nhiêu tuổi, bạn cũng nên bắt đầu tiết kiệm ngay. Kể cả với số tiền nhỏ, lãi kép sẽ giúp nhân số tiền tiết kiệm của bạn lên nhiều lần cùng thời gian.',
            },
            {
                title: 'Hãy tiết kiệm/đầu tư thường xuyên',
                body: 'Hãy giữ nguyên tắc và tiết kiệm mỗi tháng. Như bạn thấy, chỉ cần tiết kiệm đủ chỉ 1 triệu / tháng cũng có thể sinh ra số tiền lớn tới gần 500 triệu sau 20 năm. Và nếu bạn tiết kiệm lâu hơn, là 40 năm thay vì 20 năm, con số mà bạn nhận được sẽ lên tới 2.356.274.847 VNĐ sau 40 năm!',
            },
            {
                title: 'Lựa chọn kênh tiết kiệm/đầu tư hiệu quả nhất',
                body: 'Mỗi ngân hàng hay tổ chức tài chính trên thị trường phần lớn đều có mức lãi suất khác nhau dựa vào chính sách dành cho khách hàng và lợi thế cạnh tranh mà họ mong muốn. Thậm chí, trong cùng một ngân hàng cũng sẽ có nhiều gói tiết kiệm / đầu tư với mức lãi suất và chính sách khác nhau. Vì vậy, hãy tham khảo nhiều chương trình tiết kiệm / đầu tư đang có mặt trên thị trường để lựa chọn được kênh phù hợp nhất với mức tài chính và kế hoạch của bạn.',
            },
        ],
    },
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

function calcCompound(principal, monthlyContrib, years, annualRate, freqKey) {
    const freq = FREQ_OPTIONS.find(f => f.key === freqKey);
    const m = freq.m;
    const r = annualRate / 100 / m;
    const pmt = monthlyContrib * (12 / m);

    const chartData = [];
    for (let yr = 0; yr <= years; yr++) {
        const n = yr * m;
        const factor = r > 0 ? Math.pow(1 + r, n) : 1;
        const fv = principal * factor + (r > 0 ? pmt * (factor - 1) / r : pmt * n);
        const deposits = principal + monthlyContrib * 12 * yr;
        chartData.push({
            name: `Năm ${yr}`,
            'Tiền gốc': Math.round(deposits),
            'Giá trị tương lai': Math.round(Math.max(fv, deposits)),
        });
    }

    const finalFV = chartData[years]['Giá trị tương lai'];
    const totalDeposits = principal + monthlyContrib * 12 * years;
    const totalInterest = finalFV - totalDeposits;
    return { chartData, finalFV, totalDeposits, totalInterest };
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', fontSize: '13px', boxShadow: '0 4px 6px rgba(0,0,0,0.08)' }}>
            <p style={{ fontWeight: '600', marginBottom: '6px' }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
                    {p.name}: {fmt(p.value)} VNĐ
                </p>
            ))}
        </div>
    );
}

const stepBarStyle = {
    background: GREEN, color: 'white', padding: '10px 16px',
    borderRadius: '6px', fontWeight: '600', marginBottom: '16px', fontSize: '15px',
};
const inputWrapStyle = {
    display: 'flex', alignItems: 'center',
    border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden', background: 'white',
};
const plainInputStyle = {
    width: '100%', border: '1px solid #d1d5db', borderRadius: '6px',
    padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};
const labelStyle  = { fontWeight: '600', marginBottom: '4px', display: 'block', fontSize: '14px' };
const hintStyle   = { fontSize: '12px', color: '#6b7280', marginBottom: '6px' };
const groupStyle  = { marginBottom: '20px' };

export default function TinhLaiKepPage() {
    const [principalStr, setPrincipalStr] = useState('');
    const [monthlyStr, setMonthlyStr]     = useState('');
    const [yearsStr, setYearsStr]         = useState('');
    const [rateStr, setRateStr]           = useState('');
    const [freq, setFreq]                 = useState('annual');
    const [showDrop, setShowDrop]         = useState(false);
    const [result, setResult]             = useState(null);
    const [showDetail, setShowDetail]     = useState(false);
    const [openFaq, setOpenFaq]           = useState(null);

    const selectedFreq = FREQ_OPTIONS.find(f => f.key === freq);

    function handleCalc() {
        const principal = parseNum(principalStr);
        const monthly   = parseNum(monthlyStr);
        const years     = parseInt(yearsStr) || 0;
        const rate      = parseFloat(rateStr) || 0;
        if (years <= 0 || rate <= 0) return;
        setResult(calcCompound(principal, monthly, years, rate, freq));
        setShowDetail(false);
    }

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', paddingTop: '24px', paddingBottom: '48px' }}>
            <style>{`
                @media (max-width: 768px) {
                    .tool-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
            <div className="tool-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

                {/* ── LEFT COLUMN ── */}
                <div>
                    {/* CALCULATOR */}
                    <div style={{ background: 'white', borderRadius: '8px', padding: '24px', marginBottom: '16px' }}>
                        <h1 style={{ color: GREEN, fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                            Công cụ tính Lãi Kép, Giá trị tiền gửi, Lợi nhuận đầu tư Miễn Phí
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
                            Công cụ ứng dụng lãi suất kép để tính toán tiền gửi, lợi nhuận đầu tư thu được trong tương lai dựa trên kế hoạch tiết kiệm, đầu tư hàng tháng và lãi suất kỳ vọng hoàn toàn miễn phí trên TopCV.
                        </p>

                        {/* Step 1 */}
                        <div style={stepBarStyle}>Bước 1: Đầu tư ban đầu</div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Số tiền gốc ban đầu (VNĐ)</label>
                            <p style={hintStyle}>Số tiền bạn có sẵn để đầu tư ban đầu.</p>
                            <div style={inputWrapStyle}>
                                <span style={{ background: GREEN, color: 'white', padding: '10px 14px', fontWeight: '700', fontSize: '18px' }}>+</span>
                                <input
                                    type="text"
                                    placeholder="VD: 10,000,000"
                                    value={principalStr}
                                    onChange={e => setPrincipalStr(fmtInput(e.target.value))}
                                    style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: '14px' }}
                                />
                                <span style={{ padding: '10px 12px', color: '#9ca3af', fontSize: '13px' }}>VNĐ</span>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div style={stepBarStyle}>Bước 2: Khoản đóng góp</div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Số tiền gửi mỗi tháng (VNĐ)</label>
                            <p style={hintStyle}>Số tiền bạn định thêm vào tiền gốc hàng tháng.</p>
                            <div style={inputWrapStyle}>
                                <span style={{ background: GREEN, color: 'white', padding: '10px 14px', fontWeight: '700', fontSize: '18px' }}>+</span>
                                <input
                                    type="text"
                                    placeholder="VD: 10,000,000"
                                    value={monthlyStr}
                                    onChange={e => setMonthlyStr(fmtInput(e.target.value))}
                                    style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: '14px' }}
                                />
                                <span style={{ padding: '10px 12px', color: '#9ca3af', fontSize: '13px' }}>VNĐ</span>
                            </div>
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Thời gian gửi (Năm)</label>
                            <p style={hintStyle}>Khoảng thời gian, tính bằng năm, mà bạn dự định tiết kiệm.</p>
                            <input
                                type="number" min="1" placeholder="VD: 10"
                                value={yearsStr}
                                onChange={e => setYearsStr(e.target.value)}
                                style={plainInputStyle}
                            />
                        </div>

                        {/* Step 3 */}
                        <div style={stepBarStyle}>Bước 3: Lãi suất</div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Lãi suất (%)</label>
                            <p style={hintStyle}>Lãi suất ước tính theo kỳ hạn gửi của bạn.</p>
                            <input
                                type="number" min="0" step="0.1" placeholder="VD: 10"
                                value={rateStr}
                                onChange={e => setRateStr(e.target.value)}
                                style={plainInputStyle}
                            />
                        </div>

                        {/* Step 4 */}
                        <div style={stepBarStyle}>Bước 4: Kỳ hạn</div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Định kỳ gửi</label>
                            <p style={hintStyle}>Kỳ hạn nhận lãi tiền gửi của bạn.</p>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowDrop(v => !v)}
                                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', background: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    {selectedFreq.label}
                                    <ChevronDown size={16} color="#6b7280" />
                                </button>
                                {showDrop && (
                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '2px' }}>
                                        <input
                                            autoFocus
                                            placeholder="Tìm kiếm..."
                                            style={{ width: '100%', border: 'none', borderBottom: '1px solid #e5e7eb', padding: '8px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                        {FREQ_OPTIONS.map(o => (
                                            <div
                                                key={o.key}
                                                onClick={() => { setFreq(o.key); setShowDrop(false); }}
                                                style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '14px', background: freq === o.key ? '#f0fdf4' : 'white', color: freq === o.key ? GREEN : '#374151' }}
                                                onMouseEnter={e => { if (freq !== o.key) e.currentTarget.style.background = '#f9fafb'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = freq === o.key ? '#f0fdf4' : 'white'; }}
                                            >
                                                {o.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                            <button
                                onClick={handleCalc}
                                style={{ background: GREEN, color: 'white', border: 'none', borderRadius: '6px', padding: '12px 48px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Tính lãi
                            </button>
                        </div>
                    </div>

                    {/* RESULT */}
                    {result && (
                        <div style={{ background: 'white', borderRadius: '8px', padding: '24px', marginBottom: '16px' }}>
                            <p style={{ textAlign: 'center', fontSize: '18px', fontWeight: '500', marginBottom: '20px' }}>
                                Kết quả trong{' '}
                                <strong style={{ color: GREEN }}>{yearsStr}</strong>{' '}
                                năm bạn sẽ có{' '}
                                <strong style={{ color: GREEN }}>{fmt(result.finalFV)}</strong>{' '}
                                (VNĐ)
                            </p>

                            <div style={{ marginBottom: '8px', display: 'flex', gap: '24px', justifyContent: 'center', fontSize: '13px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '32px', height: '4px', background: GREEN, display: 'inline-block', borderRadius: '2px' }} />
                                    Tiền gốc (VNĐ)
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '32px', height: '4px', background: '#3b82f6', display: 'inline-block', borderRadius: '2px' }} />
                                    Giá trị tương lai (VNĐ)
                                </span>
                            </div>

                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1e6).toFixed(0)} tr`} width={55} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="Tiền gốc" stroke={GREEN} strokeWidth={2} dot={false} legendType="none" />
                                    <Line type="monotone" dataKey="Giá trị tương lai" stroke="#3b82f6" strokeWidth={2} dot={false} legendType="none" />
                                </LineChart>
                            </ResponsiveContainer>

                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <button
                                    onClick={() => setShowDetail(v => !v)}
                                    style={{ background: GREEN, color: 'white', border: 'none', borderRadius: '6px', padding: '10px 32px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    {showDetail ? 'Ẩn chi tiết' : 'Hiện chi tiết'}
                                </button>
                            </div>

                            {showDetail && (
                                <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ background: '#f9fafb' }}>
                                                {['Năm', 'Tiền gốc (VNĐ)', 'Lãi suất kép (VNĐ)', 'Tổng tiền (VNĐ)'].map(h => (
                                                    <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Năm' ? 'left' : 'right', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.chartData.map((row, i) => {
                                                const interest = row['Giá trị tương lai'] - row['Tiền gốc'];
                                                return (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        <td style={{ padding: '10px 12px' }}>{row.name}</td>
                                                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{fmt(row['Tiền gốc'])}</td>
                                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: GREEN }}>{fmt(interest)}</td>
                                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600' }}>{fmt(row['Giá trị tương lai'])}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CROSS-LINKS */}
                    <div style={{ background: 'white', borderRadius: '8px', padding: '14px 20px', marginBottom: '16px', fontSize: '13px' }}>
                        Có thể bạn quan tâm:{' '}
                        <a href="/cong-cu/tinh-luong-gross-net" style={{ color: GREEN }}>Công cụ tính lương Gross – Net</a>
                        {', '}
                        <a href="/cong-cu/tinh-thue-thu-nhap-ca-nhan" style={{ color: GREEN }}>Công cụ tính thuế thu nhập cá nhân</a>
                    </div>

                    {/* ARTICLE */}
                    <div style={{ background: 'white', borderRadius: '8px', padding: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Công cụ tính lãi suất kép</h2>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '12px' }}>
                            Lãi suất kép trong tiếng Anh là Compound Interest, được Einstein nhận định là "kỳ quan thứ 8 của thế giới. Những ai hiểu được nó từ đó sẽ kiếm được tiền, ai không hiểu sẽ phải trả chi phí cho điều đó". "Thiên tài đầu tư" Warren Buffett cũng từng chia sẻ lý do vì sao ông giàu có: "Sự giàu có của tôi kết hợp từ cuộc sống ở Mỹ, gen tốt và Lãi suất kép".
                        </p>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '24px' }}>
                            Bạn hoàn toàn có thể trở nên giàu có như Warren Buffett nếu bạn biết tận dụng sức mạnh của lãi kép, kết hợp với việc đầu tư thường xuyên, nhất quán trong một thời gian dài. Công cụ tính lãi suất kép của TopCV dưới đây sẽ giúp bạn tính toán và dự báo sự tăng trưởng "khối tài sản" (khoản gửi tiết kiệm, đầu tư) của mình trong một thời gian nhất định.
                        </p>

                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Lãi suất kép là gì?</h3>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '24px' }}>
                            Lãi suất kép (lãi kép) hay còn được gọi là lãi cộng dồn, có nghĩa là khi đến kỳ nhận lãi của khoản đầu tư thì bạn lại lấy đó nhập vào thân gốc và tiếp tục đầu tư cuối chu kỳ tiếp theo. Cứ lặp đi lặp lại như vậy xuyên suốt thời gian dài tố gửi tiết kiệm thì được coi là lãi suất kép.
                        </p>

                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Công thức tính lãi suất kép trong toán học</h3>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '12px' }}>
                            Công thức: <strong>F<sub>n</sub> = P * (1 + i/m)<sup>(n * m)</sup></strong>
                        </p>
                        <div style={{ textAlign: 'center', margin: '20px 0', padding: '28px 20px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '30px', fontFamily: 'Georgia, serif', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span>F<sub style={{ fontSize: '16px' }}>n</sub></span>
                                <span style={{ margin: '0 6px' }}>=</span>
                                <span>P</span>
                                <span style={{ fontSize: '38px', lineHeight: 1 }}>(</span>
                                <span>1 +</span>
                                <span style={{ display: 'inline-block', textAlign: 'center', verticalAlign: 'middle', margin: '0 4px' }}>
                                    <span style={{ display: 'block', borderBottom: '2px solid #374151', padding: '0 6px', fontSize: '26px', lineHeight: 1.2 }}>i</span>
                                    <span style={{ display: 'block', padding: '0 6px', fontSize: '26px', lineHeight: 1.2 }}>m</span>
                                </span>
                                <span style={{ fontSize: '38px', lineHeight: 1 }}>)</span>
                                <sup style={{ fontSize: '16px', marginTop: '-16px' }}>n·m</sup>
                            </div>
                            <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '13px' }}>Công thức tính lãi suất kép</p>
                        </div>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '8px' }}>Trong đó:</p>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '24px' }}>
                            <li>F<sub>n</sub> là giá trị của khoản đầu tư trong khoảng thời gian n năm mà bạn nhận được.</li>
                            <li>P là giá trị khoản đầu tư hiện tại của bạn.</li>
                            <li>i là lãi suất hàng năm của khoản đầu tư từ do. Ví dụ lãi suất 10%/năm, thì i được hiểu là 0,1.</li>
                            <li>n là số năm bạn dự tính đầu tư.</li>
                            <li>m là số lần ghép lại trong 1 năm, nếu lãi nhận hàng năm thì m là 1.</li>
                        </ul>

                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Sức mạnh của lãi suất kép</h3>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '12px' }}>
                            Bạn đang có trong tay 100 triệu. Bạn muốn đầu tư với lãi suất 8%/năm.
                        </p>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '12px' }}>
                            Nếu áp dụng lãi đơn, sau 5 năm bạn nhận được: 100 * (1 + 8%*5) = 140 triệu đồng. Số tiền này còn cao hơn khi bạn sử dụng công thức lãi kép như sau: 100 * (1 + 8%)^5 = 146,93 triệu đồng.
                        </p>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '16px' }}>
                            Sức mạnh của lãi kép trở nên rõ ràng hơn khi bạn nhìn vào biểu đồ tổng tăng trưởng dài hạn dưới đây:
                        </p>
                        <div
                            style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', cursor: 'pointer' }}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <Image src={bannerImg} alt="Lãi kép 10% trong 20 năm" style={{ width: '100%', height: 'auto' }} />
                        </div>
                        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginBottom: '24px' }}>Sức mạnh của lãi suất kép</p>

                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '12px' }}>
                            Đây là biểu đồ ví dụ về khoản đầu tư $1000 ban đầu. Giả thiết thời gian đầu tư là 20 năm ở mức 10% mỗi năm. Khi so sánh lợi ích của lãi suất kép so với lãi suất đơn hay không có lãi suất nào, rõ ràng là chúng ta có thể thấy lãi suất kép có thể tăng giá trị đầu tư của bạn như thế nào.
                        </p>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '24px' }}>
                            Vì vậy, so với lãi đơn thì lãi kép có sức mạnh kì diệu hơn hẳn và đem lại cho chúng ta mức lợi nhuận cao hơn cùng một khoản đầu tư.
                        </p>

                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Sử dụng công cụ tính lãi kép từ TopCV để tiết kiệm cho tương lai</h3>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '12px' }}>
                            Bộ công cụ tính lãi kép từ TopCV giúp bạn tính được số tiền mà bạn sẽ nhận được khi gửi tiết kiệm hoặc đầu tư.
                        </p>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '12px' }}>Giải thích công thức</p>
                        {['Bước 1: Đầu tư ban đầu', 'Bước 2: Khoản đóng góp', 'Bước 3: Lãi suất', 'Bước 4: Kỳ hạn'].map((s, i) => (
                            <div key={i} style={{ ...stepBarStyle, fontSize: '14px' }}>{s}</div>
                        ))}
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '8px' }}>Giải nghĩa các biến số trong công thức tính:</p>
                        <ul style={{ paddingLeft: '20px', color: '#374151', lineHeight: '1.9', marginBottom: '12px' }}>
                            <li>Số tiền gốc ban đầu: Là số tiền mà bạn bỏ ra ngay từ đầu để gửi tiết kiệm ngân hàng hoặc đầu tư</li>
                            <li>Số tiền gửi mỗi kỳ: Số tiền bạn gửi vào tài khoản tiết kiệm ngân hàng hoặc đầu tư định kỳ</li>
                            <li>Thời gian gửi: Khoảng thời gian mà bạn gửi tiết kiệm ngân hàng hoặc đầu tư</li>
                            <li>Lãi suất (%): Là lãi suất mà bạn nhận được từ việc gửi tiết kiệm ngân hàng hoặc đầu tư. Lãi suất này được quy theo năm hoặc tháng</li>
                            <li>Định kỳ gửi: Là tần suất mà bạn gửi vào tài khoản tiết kiệm ngân hàng hoặc đầu tư, tính theo năm hoặc tháng.</li>
                        </ul>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '12px' }}>
                            Không chỉ đưa ra con số cuối cùng mà bạn nhận được, hành trình tiết kiệm hay đầu tư của bạn còn được biểu diễn dưới dạng biểu đồ một cách trực quan nhất.
                        </p>
                        <p style={{ color: '#374151', lineHeight: '1.75', marginBottom: '24px' }}>
                            Hãy bắt đầu tích lũy và đầu tư sớm nhất có thể ngay từ bây giờ. Thời gian quả thực đóng vai trò rất quan trọng trong việc gia tăng sức mạnh của lãi kép.
                        </p>

                        {/* FAQ */}
                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Câu hỏi thường gặp</h2>
                        {FAQS.map((faq, i) => (
                            <div key={i} style={{ borderTop: '1px solid #e5e7eb' }}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    style={{ width: '100%', textAlign: 'left', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', fontSize: '15px', gap: '12px' }}
                                >
                                    {faq.q}
                                    {openFaq === i ? <ChevronUp size={18} style={{ flexShrink: 0 }} /> : <ChevronDown size={18} style={{ flexShrink: 0 }} />}
                                </button>
                                {openFaq === i && (
                                    <div style={{ paddingBottom: '16px', color: '#374151', lineHeight: '1.75', fontSize: '14px' }}>
                                        {faq.a && <p style={{ marginBottom: faq.subItems ? '12px' : 0 }}>{faq.a}</p>}
                                        {faq.subItems && faq.subItems.map((s, j) => (
                                            <div key={j} style={{ marginBottom: '12px' }}>
                                                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{s.title}</p>
                                                <p>{s.body}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: '20px' }} />
                        <p style={{ color: '#374151', lineHeight: '1.75' }}>
                            Trên đây là những chia sẻ của TopCV về lãi suất kép và công cụ tính lãi kép chính xác nhất. Hy vọng qua bài viết này bạn sẽ tận dụng được sức mạnh của lãi kép để tiết kiệm và đầu tư, từ đó đạt được mục tiêu tài chính của riêng mình.
                        </p>
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
                            'Giấy tờ thủ tục hồ sơ xin việc',
                            'Tải mẫu sơ yếu lý lịch chuẩn miễn phí',
                            'Cách viết Email xin việc tiếng Anh',
                            'Các mẫu CV tham khảo theo nhóm ngành',
                            'Mẫu đơn xin nghỉ việc chuẩn',
                            'Hướng dẫn viết CV tiếng Nhật',
                            'Các mẫu CV tham khảo theo nhóm ngành',
                        ].map((a, i, arr) => (
                            <a key={i} href="#" style={{ display: 'block', color: '#374151', fontSize: '13px', padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none', textDecoration: 'none' }}
                               onMouseEnter={e => e.currentTarget.style.color = GREEN}
                               onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
                                {a}
                            </a>
                        ))}
                    </div>

                    <div style={{ background: 'white', borderRadius: '8px', padding: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#e5e7eb', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>@</span>
                            Hỗ trợ
                        </h3>
                        <p style={{ fontSize: '13px', color: '#374151' }}>
                            Bạn có chia sẻ hay cần tư vấn về cách tính{' '}
                            <a href="#" style={{ color: GREEN }}>lãi suất kép?</a>
                        </p>
                        <p style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>
                            Hãy gửi email đề xuất tới{' '}
                            <a href="mailto:hotro@topcv.vn" style={{ color: GREEN }}>hotro@topcv.vn</a>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tag cloud footer */}
            <div style={{ maxWidth: '1200px', margin: '24px auto 0', padding: '0 16px', fontSize: '12px', color: '#6b7280', lineHeight: '2.2' }}>
                {[
                    'Việc làm', 'Việc làm Hà Nội', 'Việc làm TP. HCM', 'Việc làm Cần Thơ', 'Việc làm Đà Nẵng',
                    'Việc làm Hải Phòng', 'Việc làm Thanh Hóa', 'Việc làm Bình Dương', 'Việc làm Đồng Nai',
                    'Việc làm Tây Ninh', 'Việc làm Đà Lạt', 'Việc làm Gia Lai', 'Việc làm Nha Trang',
                    'Việc làm Ba Ria - Vũng Tàu', 'Việc làm Huế', 'Việc làm Gia sư tại Hà Nội',
                    'Việc làm Lái xe tại Hà Nội', 'Việc làm Tài xế tại Cần Thơ', 'Việc làm Tài xế tại TP. HCM',
                    'Việc làm Tài xe B2 tại TP. HCM', 'Việc làm Kế toán tại Hà Nội',
                    'Việc làm Kế toán tại TP. HCM', 'Việc làm Kế toán tại Đà Nẵng',
                    'Việc làm Marketing tại Hà Nội', 'Việc làm Marketing tại TP. HCM',
                    'Việc làm Marketing tại Đà Nẵng', 'Việc làm Ngân hàng tại Hà Nội',
                    'Việc làm Ngân hàng tại TP. HCM', 'Việc làm Nhân viên kinh doanh',
                    'Việc làm Marketing', 'Việc làm Nhân viên Marketing', 'Việc làm Content Marketing',
                    'Việc làm Kế toán', 'Việc làm Tài chính/Ngân hàng/Bảo hiểm', 'Việc làm Ngân hàng',
                    'Việc làm Hành chính nhân sự', 'Việc làm Logistics', 'Việc làm Sales Logistics',
                    'Việc làm Xây dựng', 'Việc làm Kỹ sư xây dựng', 'Việc làm Tester',
                    'Việc làm Lập trình viên .Net', 'Việc làm Lập trình viên Java',
                    'Việc làm Lập trình viên PHP', 'Việc làm Lao động phổ thông', 'Việc làm Sản xuất',
                    'Việc làm Chăm sóc khách hàng',
                ].map((t, i, arr) => (
                    <span key={t}>
                        <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}
                           onMouseEnter={e => e.currentTarget.style.color = GREEN}
                           onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
                            {t}
                        </a>
                        {i < arr.length - 1 && ',  '}
                    </span>
                ))}
            </div>
        </div>
    );
}
