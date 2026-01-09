'use client';

import DocumentCategoryChart from './DocumentCategoryChart';

interface DashboardViewProps {
  files: any[];
}

const CATEGORIES = [
  'Personal',
  'Educational',
  'Financial',
  'Legal',
  'Medical',
  'Shared With me',
  'Professional',
  'Certificate',
];

export default function DashboardView({ files }: DashboardViewProps) {
  // Count files by category
  const categoryCounts = CATEGORIES.map((category) => {
    const count = files.filter((file) => file.category === category).length;
    return {
      name: category,
      count,
      color: getCategoryColor(category),
    };
  }).filter((item) => item.count > 0);

  // Only show categories with files
  const chartData = categoryCounts;

  return (
    <div className="space-y-6">
      <DocumentCategoryChart data={chartData} />
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'Personal': '#3b82f6',        // blue
    'Educational': '#f97316',     // orange
    'Financial': '#6b7280',       // gray
    'Legal': '#eab308',            // yellow
    'Medical': '#06b6d4',         // light blue
    'Shared With me': '#10b981',  // green
    'Professional': '#1e40af',     // dark blue
    'Certificate': '#8b5cf6',     // purple
  };
  return colorMap[category] || '#6b7280';
}

