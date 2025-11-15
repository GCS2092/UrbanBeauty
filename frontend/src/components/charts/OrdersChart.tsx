'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OrdersChartProps {
  data: Array<{ period: string; orders: number; amount: number }>;
}

export default function OrdersChart({ data }: OrdersChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="orders" fill="#ec4899" name="Commandes" />
        <Bar dataKey="amount" fill="#10b981" name="Montant (€)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

