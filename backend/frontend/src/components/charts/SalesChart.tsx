'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  data: Array<{ date: string; sales: number; revenue: number }>;
  type?: 'line' | 'bar';
}

export default function SalesChart({ data, type = 'line' }: SalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  const ChartComponent = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <DataComponent type="monotone" dataKey="sales" stroke="#ec4899" fill="#ec4899" name="Ventes" />
        <DataComponent type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" name="Revenus (FCFA)" />
      </ChartComponent>
    </ResponsiveContainer>
  );
}

