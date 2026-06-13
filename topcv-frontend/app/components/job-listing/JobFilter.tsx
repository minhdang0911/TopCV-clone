'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';

const GREEN = '#00b14f';

// Dựa theo WorkingType enum trong schema.prisma
const WORKING_TYPE_OPTIONS = [
    { value: 'TOAN_THOI_GIAN', label: 'Toàn thời gian' },
    { value: 'BAN_THOI_GIAN', label: 'Bán thời gian' },
    { value: 'FREELANCE', label: 'Freelance' },
    { value: 'THUC_TAP', label: 'Thực tập' },
    { value: 'REMOTE', label: 'Remote' },
];

// Dựa theo WorkingDays enum
const WORKING_DAYS_OPTIONS = [
    { value: 'MON_FRI', label: 'Thứ 2 - Thứ 6' },
    { value: 'MON_SAT', label: 'Thứ 2 - Thứ 7' },
    { value: 'MON_SUN', label: 'Thứ 2 - Chủ nhật' },
    { value: 'FLEXIBLE', label: 'Linh hoạt' },
];

// Dựa theo JobLevel enum
const LEVEL_OPTIONS = [
    { value: 'NHAN_VIEN', label: 'Nhân viên' },
    { value: 'TRUONG_NHOM', label: 'Trưởng nhóm' },
    { value: 'TRUONG_PHO_PHONG', label: 'Trưởng/Phó phòng' },
    { value: 'QUAN_LY_GIAM_SAT', label: 'Quản lý/Giám sát' },
    { value: 'TRUONG_CHI_NHANH', label: 'Trưởng chi nhánh' },
    { value: 'PHO_GIAM_DOC', label: 'Phó giám đốc' },
    { value: 'GIAM_DOC', label: 'Giám đốc' },
    { value: 'THUC_TAP_SINH', label: 'Thực tập sinh' },
];

// Dựa theo salary overlap logic trong jobs.service.ts
const SALARY_OPTIONS = [
    { label: 'Dưới 10 triệu', salaryMax: 10_000_000 },
    { label: '10 - 15 triệu', salaryMin: 10_000_000, salaryMax: 15_000_000 },
    { label: '15 - 20 triệu', salaryMin: 15_000_000, salaryMax: 20_000_000 },
    { label: '20 - 25 triệu', salaryMin: 20_000_000, salaryMax: 25_000_000 },
    { label: '25 - 30 triệu', salaryMin: 25_000_000, salaryMax: 30_000_000 },
    { label: '30 - 50 triệu', salaryMin: 30_000_000, salaryMax: 50_000_000 },
    { label: 'Trên 50 triệu', salaryMin: 50_000_000 },
];

// Dựa theo experience field trong Job model (String?)
const EXPERIENCE_OPTIONS = [
    { value: 'Không yêu cầu', label: 'Không yêu cầu' },
    { value: 'Dưới 1 năm', label: 'Dưới 1 năm' },
    { value: '1 năm', label: '1 năm' },
    { value: '2 năm', label: '2 năm' },
    { value: '3 năm', label: '3 năm' },
    { value: '4 năm', label: '4 năm' },
    { value: '5 năm', label: '5 năm' },
    { value: 'Trên 5 năm', label: 'Trên 5 năm' },
];

interface Industry {
    id: number;
    name: string;
}
interface JobPosition {
    id: number;
    name: string;
}

interface JobFilterProps {
    industries: Industry[];
    jobPositions: JobPosition[];
    activeIndustryId?: string;
    activeJobPositionId?: string;
}

function FilterSection({
    title,
    children,
    defaultOpen = true,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '14px', marginBottom: '14px' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    padding: '0 0 10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#374151',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                }}
            >
                {title}
                {open ? <ChevronUp size={14} color="#9ca3af" /> : <ChevronDown size={14} color="#9ca3af" />}
            </button>
            {open && <div>{children}</div>}
        </div>
    );
}

function CheckItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 0',
                cursor: 'pointer',
                fontSize: '13px',
                color: checked ? GREEN : '#374151',
                fontWeight: checked ? '600' : '400',
                userSelect: 'none',
            }}
        >
            {/* Custom checkbox */}
            <div
                onClick={onChange}
                style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: `2px solid ${checked ? GREEN : '#d1d5db'}`,
                    background: checked ? GREEN : 'white',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                }}
            >
                {checked && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path
                            d="M1.5 4.5l2.3 2.3 3.7-4"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>
            <span onClick={onChange}>{label}</span>
        </label>
    );
}

export default function JobFilter({ industries, jobPositions, activeIndustryId, activeJobPositionId }: JobFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Parse multi-value từ URL (comma-separated cho checkbox multi-select)
    const getMulti = (key: string) => {
        const val = searchParams.get(key);
        return val ? val.split(',').filter(Boolean) : [];
    };

    const [industryIds, setIndustryIds] = useState<string[]>(
        activeIndustryId ? [activeIndustryId] : getMulti('industryId'),
    );
    const [jobPositionIds, setJobPositionIds] = useState<string[]>(
        activeJobPositionId ? [activeJobPositionId] : getMulti('jobPositionId'),
    );
    const [workingTypes, setWorkingTypes] = useState<string[]>(getMulti('workingType'));
    const [workingDays, setWorkingDays] = useState<string[]>(getMulti('workingDays'));
    const [levels, setLevels] = useState<string[]>(getMulti('level'));
    const [experiences, setExperiences] = useState<string[]>(getMulti('experience'));
    const [salaryIndex, setSalaryIndex] = useState<string>(searchParams.get('salaryPreset') || '');
    const [salaryCustomMin, setSalaryCustomMin] = useState('');
    const [salaryCustomMax, setSalaryCustomMax] = useState('');

    const buildAndPush = useCallback(
        (updates: Record<string, string | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', '1');
            params.delete('company_field');

            Object.entries(updates).forEach(([key, val]) => {
                if (val) params.set(key, val);
                else params.delete(key);
            });

            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams],
    );

    // Toggle helper cho array state
    const toggle = (arr: string[], val: string) => (arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

    const hasActiveFilter =
        industryIds.length > 0 ||
        jobPositionIds.length > 0 ||
        workingTypes.length > 0 ||
        workingDays.length > 0 ||
        levels.length > 0 ||
        experiences.length > 0 ||
        salaryIndex !== '' ||
        salaryCustomMin ||
        salaryCustomMax;

    const clearAll = () => {
        setIndustryIds([]);
        setJobPositionIds([]);
        setWorkingTypes([]);
        setWorkingDays([]);
        setLevels([]);
        setExperiences([]);
        setSalaryIndex('');
        setSalaryCustomMin('');
        setSalaryCustomMax('');

        const params = new URLSearchParams(searchParams.toString());
        [
            'industryId',
            'jobPositionId',
            'workingType',
            'workingDays',
            'level',
            'experience',
            'salaryMin',
            'salaryMax',
            'salaryPreset',
            'company_field',
        ].forEach((k) => params.delete(k));
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    // Handlers
    const handleIndustry = (id: string) => {
        const next = toggle(industryIds, id);
        setIndustryIds(next);
        buildAndPush({ industryId: next.join(',') || undefined });
    };

    const handleJobPosition = (id: string) => {
        const next = toggle(jobPositionIds, id);
        setJobPositionIds(next);
        buildAndPush({ jobPositionId: next.join(',') || undefined });
    };

    const handleWorkingType = (val: string) => {
        const next = toggle(workingTypes, val);
        setWorkingTypes(next);
        buildAndPush({ workingType: next.join(',') || undefined });
    };

    const handleWorkingDays = (val: string) => {
        const next = toggle(workingDays, val);
        setWorkingDays(next);
        buildAndPush({ workingDays: next.join(',') || undefined });
    };

    const handleLevel = (val: string) => {
        const next = toggle(levels, val);
        setLevels(next);
        buildAndPush({ level: next.join(',') || undefined });
    };

    const handleExperience = (val: string) => {
        const next = toggle(experiences, val);
        setExperiences(next);
        buildAndPush({ experience: next.join(',') || undefined });
    };

    const handleSalaryPreset = (idx: string) => {
        const newIdx = salaryIndex === idx ? '' : idx;
        setSalaryIndex(newIdx);
        setSalaryCustomMin('');
        setSalaryCustomMax('');

        if (newIdx === '') {
            buildAndPush({ salaryMin: undefined, salaryMax: undefined, salaryPreset: undefined });
        } else {
            const preset = SALARY_OPTIONS[Number(newIdx)];
            buildAndPush({
                salaryMin: preset.salaryMin?.toString(),
                salaryMax: preset.salaryMax?.toString(),
                salaryPreset: newIdx,
            });
        }
    };

    const applySalaryCustom = () => {
        setSalaryIndex('');
        buildAndPush({
            salaryMin: salaryCustomMin || undefined,
            salaryMax: salaryCustomMax || undefined,
            salaryPreset: undefined,
        });
    };

    return (
        <div
            style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '18px 16px',
                position: 'sticky',
                top: '88px',
                maxHeight: 'calc(100vh - 110px)',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#e5e7eb transparent',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    paddingBottom: '14px',
                    borderBottom: '1px solid #f3f4f6',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <SlidersHorizontal size={15} color={GREEN} />
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Lọc nâng cao</span>
                </div>
                {hasActiveFilter && (
                    <button
                        onClick={clearAll}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#ef4444',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: 0,
                        }}
                    >
                        <X size={11} /> Xóa lọc (
                        {
                            [
                                ...industryIds,
                                ...jobPositionIds,
                                ...workingTypes,
                                ...workingDays,
                                ...levels,
                                ...experiences,
                                ...(salaryIndex || salaryCustomMin || salaryCustomMax ? ['salary'] : []),
                            ].length
                        }
                        )
                    </button>
                )}
            </div>

            {/* Ngành nghề */}
            {industries.length > 0 && (
                <FilterSection title="Ngành nghề">
                    {industries.map((ind) => (
                        <CheckItem
                            key={ind.id}
                            label={ind.name}
                            checked={industryIds.includes(String(ind.id))}
                            onChange={() => handleIndustry(String(ind.id))}
                        />
                    ))}
                </FilterSection>
            )}

            {/* Vị trí */}
            {jobPositions.length > 0 && (
                <FilterSection title="Vị trí công việc">
                    {jobPositions.slice(0, 10).map((pos) => (
                        <CheckItem
                            key={pos.id}
                            label={pos.name}
                            checked={jobPositionIds.includes(String(pos.id))}
                            onChange={() => handleJobPosition(String(pos.id))}
                        />
                    ))}
                </FilterSection>
            )}

            {/* Hình thức làm việc — WorkingType enum */}
            <FilterSection title="Hình thức làm việc">
                {WORKING_TYPE_OPTIONS.map((opt) => (
                    <CheckItem
                        key={opt.value}
                        label={opt.label}
                        checked={workingTypes.includes(opt.value)}
                        onChange={() => handleWorkingType(opt.value)}
                    />
                ))}
            </FilterSection>

            {/* Ngày làm việc — WorkingDays enum */}
            <FilterSection title="Ngày làm việc" defaultOpen={false}>
                {WORKING_DAYS_OPTIONS.map((opt) => (
                    <CheckItem
                        key={opt.value}
                        label={opt.label}
                        checked={workingDays.includes(opt.value)}
                        onChange={() => handleWorkingDays(opt.value)}
                    />
                ))}
            </FilterSection>

            {/* Kinh nghiệm — experience field (String?) */}
            <FilterSection title="Kinh nghiệm">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 8px' }}>
                    {EXPERIENCE_OPTIONS.map((opt) => (
                        <CheckItem
                            key={opt.value}
                            label={opt.label}
                            checked={experiences.includes(opt.value)}
                            onChange={() => handleExperience(opt.value)}
                        />
                    ))}
                </div>
            </FilterSection>

            {/* Cấp bậc — JobLevel enum */}
            <FilterSection title="Cấp bậc" defaultOpen={false}>
                {LEVEL_OPTIONS.map((opt) => (
                    <CheckItem
                        key={opt.value}
                        label={opt.label}
                        checked={levels.includes(opt.value)}
                        onChange={() => handleLevel(opt.value)}
                    />
                ))}
            </FilterSection>

            {/* Mức lương — salary overlap logic từ jobs.service */}
            <FilterSection title="Mức lương" defaultOpen={false}>
                {SALARY_OPTIONS.map((opt, i) => (
                    <CheckItem
                        key={i}
                        label={opt.label}
                        checked={salaryIndex === String(i)}
                        onChange={() => handleSalaryPreset(String(i))}
                    />
                ))}

                {/* Custom range */}
                <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px', fontWeight: '500' }}>
                        Hoặc nhập khoảng lương (triệu)
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                            type="number"
                            placeholder="Từ"
                            value={salaryCustomMin}
                            onChange={(e) => {
                                setSalaryCustomMin(e.target.value);
                                setSalaryIndex('');
                            }}
                            style={{
                                flex: 1,
                                minWidth: 0,
                                padding: '5px 7px',
                                fontSize: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                outline: 'none',
                            }}
                        />
                        <span style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>-</span>
                        <input
                            type="number"
                            placeholder="Đến"
                            value={salaryCustomMax}
                            onChange={(e) => {
                                setSalaryCustomMax(e.target.value);
                                setSalaryIndex('');
                            }}
                            style={{
                                flex: 1,
                                minWidth: 0,
                                padding: '5px 7px',
                                fontSize: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                outline: 'none',
                            }}
                        />
                    </div>
                    <button
                        onClick={applySalaryCustom}
                        style={{
                            marginTop: '8px',
                            width: '100%',
                            padding: '6px',
                            background: GREEN,
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        Áp dụng
                    </button>
                </div>
            </FilterSection>
        </div>
    );
}
