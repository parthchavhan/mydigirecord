'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DocumentCategory {
  name: string;
  count: number;
  color: string;
}

interface DocumentCategoryChartProps {
  data: DocumentCategory[];
}

const COLORS = [
  '#3b82f6', // blue
  '#f97316', // orange
  '#6b7280', // gray
  '#eab308', // yellow
  '#06b6d4', // light blue
  '#10b981', // green
  '#1e40af', // dark blue
];

export default function DocumentCategoryChart({ data }: DocumentCategoryChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.count,
    color: item.color || COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} {payload[0].value === 1 ? 'document' : 'documents'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0 || chartData.every(item => item.value === 0)) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">No. of Documents</h3>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">No documents to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">No. of Documents</h3>
      <div className="flex items-center justify-center min-h-[400px]">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="middle"
              align="right"
              iconType="square"
              wrapperStyle={{ paddingLeft: '20px' }}
              formatter={(value: string) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

