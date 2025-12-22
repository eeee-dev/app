import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface StatsCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  activeProjects: number;
}

export default function StatsCards({
  totalIncome,
  totalExpenses,
  netProfit,
  activeProjects,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Income',
      value: `Rs ${totalIncome.toLocaleString()}`,
      icon: TrendingUp,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Total Expenses',
      value: `Rs ${totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      trend: '+8.2%',
      trendUp: false,
    },
    {
      title: 'Net Profit',
      value: `Rs ${netProfit.toLocaleString()}`,
      icon: DollarSign,
      trend: '+18.7%',
      trendUp: true,
    },
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      icon: Activity,
      trend: '+3',
      trendUp: true,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="card-minimal hover:border-primary/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
            <p className={`text-xs mt-2 uppercase tracking-wider ${
              stat.trendUp ? 'text-primary' : 'text-destructive'
            }`}>
              {stat.trend} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}