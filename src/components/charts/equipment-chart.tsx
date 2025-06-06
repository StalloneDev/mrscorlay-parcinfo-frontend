import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface EquipmentChartProps {
  data: { status: string; count: number }[];
}

const COLORS = {
  "en service": "#38A169",
  "en maintenance": "#ED8936", 
  "hors service": "#E53E3E",
};

const STATUS_LABELS = {
  "en service": "En Service",
  "en maintenance": "En Maintenance",
  "hors service": "Hors Service",
};

export default function EquipmentChart({ data }: EquipmentChartProps) {
  const chartData = data.map(item => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    value: item.count,
    status: item.status,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.status as keyof typeof COLORS] || "#8884d8"} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name) => [value, name]}
          labelStyle={{ color: 'var(--foreground)' }}
          contentStyle={{ 
            backgroundColor: 'var(--background)', 
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          wrapperStyle={{ paddingTop: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
