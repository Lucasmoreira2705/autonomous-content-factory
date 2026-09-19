"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartData } from "./mock-data";

export function PerformanceChart() {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity={0.3}/><stop offset="100%" stopColor="currentColor" stopOpacity={0}/></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,.06)" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#7f899f", fontSize: 12 }} />
          <YAxis hide />
          <Tooltip contentStyle={{ background: "#151922", border: "1px solid #2a3040", borderRadius: 12 }} labelStyle={{ color: "#fff" }} />
          <Area type="monotone" dataKey="views" stroke="currentColor" strokeWidth={2.5} fill="url(#viewsGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
