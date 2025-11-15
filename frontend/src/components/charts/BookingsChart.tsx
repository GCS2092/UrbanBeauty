'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BookingsChartProps {
  data: Array<{ date: string; bookings: number; revenue: number }>;
}

export default function BookingsChart({ data }: BookingsChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2} name="Réservations" />
        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenus (€)" />
      </LineChart>
    </ResponsiveContainer>
  );
}

