"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailySpendPoint } from "@/lib/dashboard/queries";

const CHANNEL_COLORS: Record<string, string> = {
  META: "#4f9cf9",
  GOOGLE: "#f4b400",
  TIKTOK: "#ff2d55",
  SHOPEE: "#ff6a00",
};

export function SpendChart({ data }: { data: DailySpendPoint[] }) {
  return (
    <div className="h-72 w-full rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis dataKey="date" stroke="#737373" fontSize={12} />
          <YAxis stroke="#737373" fontSize={12} />
          <Tooltip
            contentStyle={{ background: "#171717", border: "1px solid #262626" }}
            labelStyle={{ color: "#e5e5e5" }}
          />
          {Object.entries(CHANNEL_COLORS).map(([channel, color]) => (
            <Line
              key={channel}
              type="monotone"
              dataKey={channel}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
