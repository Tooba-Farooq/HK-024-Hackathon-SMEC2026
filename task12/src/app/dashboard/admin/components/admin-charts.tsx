"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdminChartsProps {
  ridesByStatus: { status: string; count: number }[];
  carbonOverTime: { date: string; carbon: number }[];
  ridesOverTime: { date: string; count: number }[];
}

const COLORS = {
  active: "#10b981",
  completed: "#8b5cf6",
  cancelled: "#ef4444",
};

export function AdminCharts({
  ridesByStatus,
  carbonOverTime,
  ridesOverTime,
}: AdminChartsProps) {
  const pieData = ridesByStatus.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: COLORS[item.status as keyof typeof COLORS] || "#6b7280",
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2 mb-10">
      {/* Rides by Status Pie Chart */}
      <Card className="border-0 bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Rides by Status</CardTitle>
          <CardDescription>Distribution of rides across different statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Carbon Saved Over Time */}
      <Card className="border-0 bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Carbon Saved Over Time</CardTitle>
          <CardDescription>Daily carbon emission reduction (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={carbonOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)} kg CO₂`, "Carbon Saved"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="carbon"
                stroke="#10b981"
                strokeWidth={3}
                name="Carbon Saved (kg)"
                dot={{ fill: "#10b981", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rides Over Time */}
      <Card className="border-0 bg-white shadow-lg md:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Rides Created Over Time</CardTitle>
          <CardDescription>Daily ride creation trend (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ridesOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ef4444" name="Rides Created" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
