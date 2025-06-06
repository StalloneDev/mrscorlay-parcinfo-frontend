import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface TicketsChartProps {
  data: { date: string; created: number; resolved: number }[];
}

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function TicketsChart({ data }: TicketsChartProps) {
  const chartData = data.map(item => ({
    ...item,
    day: DAYS[new Date(item.date).getDay()],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis 
          dataKey="day" 
          stroke="var(--muted-foreground)"
          fontSize={12}
        />
        <YAxis 
          stroke="var(--muted-foreground)"
          fontSize={12}
        />
        <Tooltip 
          labelStyle={{ color: 'var(--foreground)' }}
          contentStyle={{ 
            backgroundColor: 'var(--background)', 
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="created" 
          stroke="#3182CE" 
          strokeWidth={2}
          name="Tickets Créés"
          dot={{ fill: '#3182CE', strokeWidth: 2, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="resolved" 
          stroke="#38A169" 
          strokeWidth={2}
          name="Tickets Résolus"
          dot={{ fill: '#38A169', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
