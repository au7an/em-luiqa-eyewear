import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  ChevronDown,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ContactInquiry, InquiryStatus } from '../../types/database';

interface InquiryAnalyticsSectionProps {
  inquiries: ContactInquiry[];
}

type FilterPreset = '7d' | '30d' | 'this_month' | 'this_year' | 'custom_month' | 'custom_year';

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; text: string; hex: string }
> = {
  New: {
    label: 'New (Baru)',
    color: 'bg-violet-500',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    hex: '#8b5cf6',
  },
  Contacted: {
    label: 'Contacted (Dihubungi)',
    color: 'bg-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    hex: '#3b82f6',
  },
  'In Production': {
    label: 'In Production (Lab)',
    color: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    hex: '#f59e0b',
  },
  Completed: {
    label: 'Completed (Selesai)',
    color: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    hex: '#10b981',
  },
  Canceled: {
    label: 'Canceled (Batal)',
    color: 'bg-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    hex: '#f43f5e',
  },
};

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const InquiryAnalyticsSection: React.FC<InquiryAnalyticsSectionProps> = ({
  inquiries,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const [preset, setPreset] = useState<FilterPreset>('7d');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Available years from inquiries or default
  const availableYears = useMemo(() => {
    const years = new Set<number>([currentYear, currentYear - 1]);
    inquiries.forEach((inq) => {
      const y = new Date(inq.created_at).getFullYear();
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [inquiries, currentYear]);

  // Hover states for tooltips
  const [hoveredBar, setHoveredBar] = useState<{
    label: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Filter inquiries based on selected date boundary
  const { filteredInquiries, rangeTitle, isMonthlyGranularity } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let startDate = new Date();
    let isMonthly = false;
    let title = '';

    switch (preset) {
      case '7d': {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        title = '7 Hari Terakhir';
        break;
      }
      case '30d': {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        title = '30 Hari Terakhir';
        break;
      }
      case 'this_month': {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
        title = `Bulan Ini (${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()})`;
        break;
      }
      case 'this_year': {
        startDate = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
        isMonthly = true;
        title = `Tahun Ini (${today.getFullYear()})`;
        break;
      }
      case 'custom_month': {
        startDate = new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0);
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
        title = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
        const filtered = inquiries.filter((inq) => {
          const d = new Date(inq.created_at);
          return d >= startDate && d <= endOfMonth;
        });
        return {
          filteredInquiries: filtered,
          rangeTitle: title,
          isMonthlyGranularity: false,
        };
      }
      case 'custom_year': {
        startDate = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
        const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
        isMonthly = true;
        title = `Tahun ${selectedYear}`;
        const filtered = inquiries.filter((inq) => {
          const d = new Date(inq.created_at);
          return d >= startDate && d <= endOfYear;
        });
        return {
          filteredInquiries: filtered,
          rangeTitle: title,
          isMonthlyGranularity: true,
        };
      }
    }

    const filtered = inquiries.filter((inq) => {
      const d = new Date(inq.created_at);
      return d >= startDate && d <= today;
    });

    return {
      filteredInquiries: filtered,
      rangeTitle: title,
      isMonthlyGranularity: isMonthly,
    };
  }, [inquiries, preset, selectedMonth, selectedYear]);

  // Aggregate Histogram Bins
  const histogramData = useMemo(() => {
    if (isMonthlyGranularity) {
      // 12 months in selected year
      const yearToUse = preset === 'this_year' ? currentYear : selectedYear;
      const monthCounts = new Array(12).fill(0);

      filteredInquiries.forEach((inq) => {
        const d = new Date(inq.created_at);
        if (d.getFullYear() === yearToUse) {
          monthCounts[d.getMonth()]++;
        }
      });

      return monthCounts.map((count, idx) => ({
        key: `m-${idx}`,
        label: MONTH_NAMES[idx].substring(0, 3),
        fullLabel: `${MONTH_NAMES[idx]} ${yearToUse}`,
        count,
      }));
    }

    // Daily Granularity
    let daysCount = 7;
    let startDay = new Date();

    if (preset === '7d') {
      daysCount = 7;
      startDay.setDate(startDay.getDate() - 6);
    } else if (preset === '30d') {
      daysCount = 30;
      startDay.setDate(startDay.getDate() - 29);
    } else if (preset === 'this_month') {
      const now = new Date();
      daysCount = now.getDate();
      startDay = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === 'custom_month') {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      daysCount = daysInMonth;
      startDay = new Date(selectedYear, selectedMonth, 1);
    }

    const dayBins: { key: string; label: string; fullLabel: string; count: number }[] = [];
    const countsMap = new Map<string, number>();

    filteredInquiries.forEach((inq) => {
      const d = new Date(inq.created_at);
      const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      countsMap.set(dateKey, (countsMap.get(dateKey) || 0) + 1);
    });

    for (let i = 0; i < daysCount; i++) {
      const cur = new Date(startDay);
      cur.setDate(startDay.getDate() + i);
      const dateKey = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`;
      const dayNum = cur.getDate();
      const monthShort = cur.toLocaleDateString('id-ID', { month: 'short' });

      dayBins.push({
        key: dateKey,
        label: daysCount > 15 ? (i % 3 === 0 || i === daysCount - 1 ? `${dayNum}` : '') : `${dayNum} ${monthShort}`,
        fullLabel: cur.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        count: countsMap.get(dateKey) || 0,
      });
    }

    return dayBins;
  }, [filteredInquiries, isMonthlyGranularity, preset, selectedMonth, selectedYear, currentYear]);

  // Aggregate Pie Chart Status Breakdown
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      New: 0,
      Contacted: 0,
      'In Production': 0,
      Completed: 0,
      Canceled: 0,
    };

    filteredInquiries.forEach((inq) => {
      // Legacy Read is treated as New
      const st = inq.status === 'Read' ? 'New' : inq.status;
      if (st in counts) {
        counts[st]++;
      } else {
        counts['New']++;
      }
    });

    const total = filteredInquiries.length;

    return Object.entries(counts).map(([status, count]) => ({
      status: status as InquiryStatus,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      config: STATUS_CONFIG[status] || STATUS_CONFIG['New'],
    }));
  }, [filteredInquiries]);

  // Max value for Histogram Y scale
  const maxCount = useMemo(() => {
    const m = Math.max(...histogramData.map((d) => d.count), 0);
    return m === 0 ? 5 : Math.ceil(m * 1.2);
  }, [histogramData]);

  // Quick Period KPIs
  const totalPeriod = filteredInquiries.length;
  const newPeriod = statusBreakdown.find((s) => s.status === 'New')?.count || 0;
  const inProdPeriod = statusBreakdown.find((s) => s.status === 'In Production')?.count || 0;
  const completedPeriod = statusBreakdown.find((s) => s.status === 'Completed')?.count || 0;
  const completionRate = totalPeriod > 0 ? Math.round((completedPeriod / totalPeriod) * 100) : 0;

  // Pie chart calculation
  const pieSlices = useMemo(() => {
    const total = filteredInquiries.length;
    if (total === 0) return [];

    let currentAngle = -Math.PI / 2; // start at top 12 o'clock
    const slices: {
      status: string;
      color: string;
      d: string;
      percentage: number;
      count: number;
    }[] = [];

    statusBreakdown.forEach((item) => {
      if (item.count === 0) return;

      const fraction = item.count / total;
      const angle = fraction * 2 * Math.PI;
      const endAngle = currentAngle + (fraction >= 0.999 ? 2 * Math.PI - 0.0001 : angle);

      const cx = 100;
      const cy = 100;
      const r = 80;
      const ir = 48;

      const x1 = cx + r * Math.cos(currentAngle);
      const y1 = cy + r * Math.sin(currentAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);

      const x3 = cx + ir * Math.cos(endAngle);
      const y3 = cy + ir * Math.sin(endAngle);
      const x4 = cx + ir * Math.cos(currentAngle);
      const y4 = cy + ir * Math.sin(currentAngle);

      const largeArc = angle > Math.PI ? 1 : 0;
      const pathData = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${largeArc} 0 ${x4} ${y4} Z`;

      slices.push({
        status: item.status,
        color: item.config.hex,
        d: pathData,
        percentage: item.percentage,
        count: item.count,
      });

      currentAngle = endAngle;
    });

    return slices;
  }, [filteredInquiries.length, statusBreakdown]);

  return (
    <div className="space-y-4">
      {/* Analytics Section Header & Filter Controls */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                <BarChart3 size={15} />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 tracking-wide uppercase">
                Inquiry & Order Analytics
              </h3>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Visualisasi volume pesanan kustom lensa dan komposisi status • Periode:{' '}
              <strong className="text-neutral-700 font-semibold">{rangeTitle}</strong>
            </p>
          </div>

          {/* Filter Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
            {[
              { id: '7d', label: '7 Hari' },
              { id: '30d', label: '30 Hari' },
              { id: 'this_month', label: 'Bulan Ini' },
              { id: 'this_year', label: 'Tahun Ini' },
              { id: 'custom_month', label: 'Pilih Bulan' },
              { id: 'custom_year', label: 'Pilih Tahun' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id as FilterPreset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  preset === p.id
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Month / Year Dropdowns Bar */}
        {(preset === 'custom_month' || preset === 'custom_year') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-3 text-xs"
          >
            <span className="text-neutral-500 font-medium flex items-center gap-1.5">
              <Calendar size={13} className="text-neutral-400" />
              <span>Pilih Rentang:</span>
            </span>

            {preset === 'custom_month' && (
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="appearance-none bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 pr-8 font-semibold text-neutral-800 text-xs focus:outline-none focus:border-neutral-900 cursor-pointer"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
              </div>
            )}

            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 pr-8 font-semibold text-neutral-800 text-xs focus:outline-none focus:border-neutral-900 cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>
          </motion.div>
        )}

        {/* Quick Period KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                Total Masuk
              </span>
              <span className="text-lg font-bold text-neutral-900">{totalPeriod}</span>
            </div>
            <TrendingUp size={16} className="text-neutral-400" />
          </div>

          <div className="p-3 rounded-lg bg-violet-50/60 border border-violet-200/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-violet-700 uppercase tracking-wider block">
                Perlu Follow Up
              </span>
              <span className="text-lg font-bold text-violet-900">{newPeriod}</span>
            </div>
            <Clock size={16} className="text-violet-500" />
          </div>

          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block">
                Diproses Lab
              </span>
              <span className="text-lg font-bold text-amber-900">{inProdPeriod}</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-200/70 px-1.5 py-0.5 rounded">
              Lab
            </span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Selesai ({completionRate}%)
              </span>
              <span className="text-lg font-bold text-emerald-900">{completedPeriod}</span>
            </div>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
        </div>
      </div>

      {/* 2-Column Chart Grid: Histogram & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (7 cols): Histogram / Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 size={14} className="text-neutral-500" />
                <span>Histogram Volume Pesanan</span>
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {isMonthlyGranularity ? 'Agregasi jumlah pesanan per bulan' : 'Frekuensi harian pesanan kustom'}
              </p>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
              Puncak: {Math.max(...histogramData.map((d) => d.count), 0)} pesanan
            </span>
          </div>

          {/* Histogram SVG Chart Area */}
          <div className="relative h-64 w-full select-none pt-2 pb-1">
            {totalPeriod === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-xs">
                <BarChart3 size={32} className="text-neutral-300 mb-2" />
                <span>Tidak ada data pesanan pada periode ini</span>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between">
                {/* Horizontal Guide Lines */}
                <div className="relative flex-1 w-full flex items-end">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                    <div className="border-b border-dashed border-neutral-200 w-full" />
                    <div className="border-b border-dashed border-neutral-200 w-full" />
                    <div className="border-b border-neutral-200 w-full" />
                  </div>

                  {/* Bars Container */}
                  <div className="relative w-full h-full flex items-end justify-between gap-1 sm:gap-2 px-1 z-10">
                    {histogramData.map((bin) => {
                      const heightPercent = maxCount > 0 ? (bin.count / maxCount) * 100 : 0;
                      const hasCount = bin.count > 0;

                      return (
                        <div
                          key={bin.key}
                          className="flex-1 h-full flex flex-col items-center justify-end group relative cursor-pointer"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredBar({
                              label: bin.fullLabel,
                              count: bin.count,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          {/* Animated Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(heightPercent, hasCount ? 8 : 2)}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className={`w-full max-w-[28px] rounded-t-sm transition-all duration-200 ${
                              hasCount
                                ? 'bg-neutral-900 group-hover:bg-neutral-700 shadow-xs'
                                : 'bg-neutral-100 group-hover:bg-neutral-200'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between items-center px-1 pt-2 border-t border-neutral-200 mt-1">
                  {histogramData.map((bin) => (
                    <span
                      key={bin.key}
                      className="flex-1 text-center text-[10px] font-mono text-neutral-400 truncate"
                    >
                      {bin.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Floating Tooltip */}
            <AnimatePresence>
              {hoveredBar && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-12 bg-neutral-950 text-white px-2.5 py-1.5 rounded-lg shadow-xl text-center text-xs whitespace-nowrap"
                  style={{ left: hoveredBar.x, top: hoveredBar.y }}
                >
                  <span className="text-[10px] text-neutral-400 block">{hoveredBar.label}</span>
                  <span className="font-bold text-white text-xs">{hoveredBar.count} Pesanan</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right (5 cols): Pie / Donut Chart */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 border-b border-neutral-100 pb-3">
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <PieChartIcon size={14} className="text-neutral-500" />
                <span>Distribusi Status Pesanan</span>
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Proporsi alur pesanan kustom dalam periode
              </p>
            </div>
          </div>

          {/* SVG Donut Chart */}
          <div className="flex flex-col items-center justify-center py-2 relative select-none">
            {totalPeriod === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-neutral-400 text-xs">
                <PieChartIcon size={32} className="text-neutral-300 mb-2" />
                <span>Belum ada pesanan pada rentang ini</span>
              </div>
            ) : (
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {pieSlices.map((slice) => {
                    const isHovered = hoveredSlice === slice.status;
                    return (
                      <path
                        key={slice.status}
                        d={slice.d}
                        fill={slice.color}
                        opacity={hoveredSlice ? (isHovered ? 1 : 0.4) : 0.9}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredSlice(slice.status)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    );
                  })}
                </svg>

                {/* Donut Center Metrics */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-neutral-900 tracking-tight">
                    {totalPeriod}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-light">Inquiries</span>
                </div>
              </div>
            )}
          </div>

          {/* Status Breakdown Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-xs">
            {statusBreakdown.map((item) => {
              const isHovered = hoveredSlice === item.status;
              return (
                <div
                  key={item.status}
                  onMouseEnter={() => setHoveredSlice(item.status)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`p-2 rounded-lg transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isHovered
                      ? 'bg-neutral-100 shadow-2xs'
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.config.hex }}
                    />
                    <span className="text-neutral-700 font-medium truncate text-[11px]">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                    <span className="font-bold text-neutral-900">{item.count}</span>
                    <span className="text-neutral-400 text-[10px]">({item.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
