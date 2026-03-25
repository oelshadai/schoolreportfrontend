import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  action?: React.ReactNode;
}

const PageHeader = ({ title, description, actionLabel, onAction, actionIcon, action }: PageHeaderProps) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
    {action || (actionLabel && (
      <Button onClick={onAction}>
        {actionIcon || <Plus className="h-4 w-4 mr-2" />}
        {actionLabel}
      </Button>
    ))}
  </div>
);

export default PageHeader;
