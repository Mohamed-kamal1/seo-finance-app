"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTheme } from "./ThemeProvider";

const PIE_COLORS = ["#3ED6A6", "#F2B84B", "#F0654F", "#5B8DEF", "#B98EF2", "#4BC7F2"];

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
