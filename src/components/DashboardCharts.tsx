"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useTheme } from "./ThemeProvider";
import { money } from "@/lib/format";

const PIE_COLORS = ["#3ED6A6", "#F2B84B", "#F0654F", "#5B8DEF", "#B98EF2", "#4BC7F2"];
const AGING_COLORS = ["#3ED6A6", "#F2B84B", "#F0654F", "#E53E3E"];

function useTooltipStyle() {
  const { theme } = useTheme();
  return {
    contentStyle: {
      background: theme === "light" ? "#FFFFFF" : "#111A2C",
      border: theme === "light" ? "1px solid #E2E8F0" : "1px solid #3ED6A6",
      borderRadius: 10,
      fontSize: 12,
      boxShadow: theme === "light" ? "0 4px 20px rgba(0,0,0,0.08)" : "0 4px 20px rgba(0,0,0,0.4)",
    },
    labelStyle: { color: theme === "light" ? "#0f172a" : "#e7edf7", fontWeight: 600 },
    itemStyle: { color: theme === "light" ? "#64748B" : "#8CA0C4" },
  };
}

export function RevenueExpenseChart({
  data,
}: {
  data: { month: string; revenue: number; expenses: number; net: number }[];
}) {
  const tooltipStyle = useTooltipStyle();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3ED6A6" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#3ED6A6" stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0654F" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#F0654F" stopOpacity={0.4} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
        <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="url(#expensesGrad)" radius={[4, 4, 0, 0]} />
        <Line type="monotone" dataKey="net" stroke="#F2B84B" strokeWidth={2.5} dot={false} strokeDasharray="4 2" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function PieLegend({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
      {data.slice(0, 6).map((entry, i) => (
        <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
          />
          {entry.name}
        </div>
      ))}
    </div>
  );
}

export function CategoryPie({ data }: { data: { name: string; value: number }[] }) {
  const tooltipStyle = useTooltipStyle();

  return (
    <div>
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82} paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <PieLegend data={data} />
    </div>
  );
}

// ─── GROUP A: DASHBOARD CHARTS ───────────────────────────────────────────────

/** 1. Receivables Aging: Horizontal bar showing invoice aging buckets */
export function ReceivablesAgingChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const tooltipStyle = useTooltipStyle();
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
          <CartesianGrid stroke="var(--line)" horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} width={55} />
          <Tooltip {...tooltipStyle} formatter={(value: number) => money(value)} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || AGING_COLORS[i % AGING_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-muted mt-1 text-right">{money(total)} total overdue</div>
    </div>
  );
}

/** 2. Monthly Profit Margin % Line Chart */
export function ProfitMarginChart({
  data,
}: {
  data: { month: string; margin: number }[];
}) {
  const tooltipStyle = useTooltipStyle();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3ED6A6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#3ED6A6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
        <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
        <Tooltip {...tooltipStyle} formatter={(value: number) => `${value.toFixed(1)}%`} />
        <Line type="monotone" dataKey="margin" stroke="#3ED6A6" strokeWidth={2.5} dot={{ r: 3, fill: "#3ED6A6" }} strokeDasharray="4 2" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** 3. Treasury Composition Pie Chart */
export function TreasuryPie({ data }: { data: { name: string; value: number }[] }) {
  return <CategoryPie data={data} />;
}

/** 4. Collection Rate Over Time Line Chart */
export function CollectionRateChart({
  data,
}: {
  data: { month: string; rate: number }[];
}) {
  const tooltipStyle = useTooltipStyle();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data}>
        <CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
        <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
        <Tooltip {...tooltipStyle} formatter={(value: number) => `${value.toFixed(1)}%`} />
        <Line type="monotone" dataKey="rate" stroke="#5B8DEF" strokeWidth={2.5} dot={{ r: 3, fill: "#5B8DEF" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ─── GROUP B: REPORTS CHARTS ─────────────────────────────────────────────────

/** 6. Service Revenue Mix Stacked Bar Chart */
export function ServiceRevenueChart({
  data,
}: {
  data: { month: string; seo: number; guest: number; hosting: number; content: number }[];
}) {
  const tooltipStyle = useTooltipStyle();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
        <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} formatter={(value: number) => money(value)} />
        <Bar dataKey="seo" stackId="a" fill="#3ED6A6" radius={[0, 0, 0, 0]} />
        <Bar dataKey="guest" stackId="a" fill="#5B8DEF" />
        <Bar dataKey="hosting" stackId="a" fill="#F2B84B" />
        <Bar dataKey="content" stackId="a" fill="#B98EF2" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ServiceRevenueLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
      <div className="flex items-center gap-1.5 text-xs text-muted"><span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 bg-[#3ED6A6]" />SEO</div>
      <div className="flex items-center gap-1.5 text-xs text-muted"><span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 bg-[#5B8DEF]" />Guest Post</div>
      <div className="flex items-center gap-1.5 text-xs text-muted"><span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 bg-[#F2B84B]" />Hosting</div>
      <div className="flex items-center gap-1.5 text-xs text-muted"><span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 bg-[#B98EF2]" />Content</div>
    </div>
  );
}

// ─── GROUP C: CLIENT DETAIL CHARTS ───────────────────────────────────────────

/** 8. Invoice Payment Timeline Mini Bar Chart */
export function InvoicePaymentTimeline({
  data,
}: {
  data: { label: string; amount: number; collected: number }[];
}) {
  const tooltipStyle = useTooltipStyle();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
        <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} formatter={(value: number) => money(value)} />
        <Bar dataKey="amount" fill="rgba(62,214,166,0.25)" radius={[3, 3, 0, 0]} maxBarSize={20} />
        <Bar dataKey="collected" fill="#3ED6A6" radius={[3, 3, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** 9. Service Fee Radar Chart */
export function FeeRadarChart({
  data,
}: {
  data: { service: string; value: number; fullMark: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--line)" />
        <PolarAngleAxis dataKey="service" stroke="var(--muted)" fontSize={10} />
        <PolarRadiusAxis stroke="var(--muted)" fontSize={9} tickFormatter={(v: number) => money(v)} />
        <Radar name="Fee" dataKey="value" stroke="#3ED6A6" fill="#3ED6A6" fillOpacity={0.2} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/** 10. Outstanding Trend Mini Line Chart */
export function OutstandingTrendChart({
  data,
}: {
  data: { month: string; outstanding: number }[];
}) {
  const tooltipStyle = useTooltipStyle();

  return (
    <ResponsiveContainer width="100%" height={180}>
      <ComposedChart data={data}>
        <CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
        <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} formatter={(value: number) => money(value)} />
        <Line type="monotone" dataKey="outstanding" stroke="#F0654F" strokeWidth={2} dot={{ r: 2, fill: "#F0654F" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
