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

const PIE_COLORS = ["#3ED6A6", "#F2B84B", "#F0654F", "#5B8DEF", "#B98EF2", "#4BC7F2"];

export function RevenueExpenseChart({
  data,
}: {
  data: { month: string; revenue: number; expenses: number; net: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data}>
        <CartesianGrid stroke="#1a2740" vertical={false} />
        <XAxis dataKey="month" stroke="#8CA0C4" fontSize={11} tickLine={false} />
        <YAxis stroke="#8CA0C4" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "#111A2C", border: "1px solid #233252", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e7edf7" }}
        />
        <Bar dataKey="revenue" fill="#3ED6A6" radius={[3, 3, 0, 0]} />
        <Bar dataKey="expenses" fill="#F0654F" radius={[3, 3, 0, 0]} />
        <Line type="monotone" dataKey="net" stroke="#F2B84B" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function CategoryPie({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#111A2C", border: "1px solid #233252", borderRadius: 8, fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
