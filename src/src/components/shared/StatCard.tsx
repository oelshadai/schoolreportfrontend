interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: string;
}

const StatCard = ({ label, value, icon, color = 'text-primary', trend }: StatCardProps) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        {trend && <p className="text-xs text-success mt-1">{trend}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-muted ${color}`}>{icon}</div>
    </div>
  </div>
);

export default StatCard;
