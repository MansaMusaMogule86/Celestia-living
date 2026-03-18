"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

// ---------- colour palettes ----------
const SOURCE_COLORS: Record<string, string> = {
  website: "#6366f1",
  bayut: "#f59e0b",
  property_finder: "#10b981",
  dubizzle: "#ef4444",
  referral: "#8b5cf6",
  walk_in: "#06b6d4",
  social_media: "#ec4899",
  other: "#94a3b8",
};

const STAGE_COLORS: Record<string, string> = {
  inquiry: "#94a3b8",
  viewing: "#6366f1",
  offer: "#f59e0b",
  negotiation: "#f97316",
  agreement: "#10b981",
  closed: "#22c55e",
  cancelled: "#ef4444",
};

// ---------- shared tooltip ----------
function CurrencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-medium capitalize mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: AED {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ---------- types ----------
export interface LeadSourceDatum {
  source: string;
  count: number;
}

export interface PipelineStageDatum {
  stage: string;
  count: number;
  value: number;
}

// ---------- Lead Sources Pie ----------
export function LeadSourcesChart({ data }: { data: LeadSourceDatum[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No lead data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="source"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          label={({ source, percent }) =>
            `${formatSourceLabel(source)} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((entry) => (
            <Cell
              key={entry.source}
              fill={SOURCE_COLORS[entry.source] || SOURCE_COLORS.other}
              className="outline-none"
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [
            value,
            formatSourceLabel(name),
          ]}
        />
        <Legend
          formatter={(value: string) => (
            <span className="text-xs capitalize">
              {formatSourceLabel(value)}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ---------- Pipeline Bar Chart ----------
export function PipelineBarChart({ data }: { data: PipelineStageDatum[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No deal data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barGap={4}>
        <XAxis
          dataKey="stage"
          tickFormatter={capitalize}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          tickFormatter={(v: number) =>
            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v)
          }
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          allowDecimals={false}
        />
        <Tooltip content={<CurrencyTooltip />} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="value"
          name="Value (AED)"
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry) => (
            <Cell
              key={entry.stage}
              fill={STAGE_COLORS[entry.stage] || "#94a3b8"}
            />
          ))}
        </Bar>
        <Bar
          yAxisId="right"
          dataKey="count"
          name="Deals"
          fill="#a78bfa"
          radius={[4, 4, 0, 0]}
          opacity={0.7}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- helpers ----------
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatSourceLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
