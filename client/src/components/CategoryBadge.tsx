import { Badge } from "@/components/ui/badge";
import { Hammer, Sofa, Wrench } from "lucide-react";

interface CategoryBadgeProps {
  category: 'construction' | 'furniture' | 'services';
  variant?: 'default' | 'secondary' | 'outline';
}

const categoryConfig = {
  construction: {
    label: 'Construction',
    icon: Hammer,
    color: 'text-primary',
  },
  furniture: {
    label: 'Furniture',
    icon: Sofa,
    color: 'text-blue-600',
  },
  services: {
    label: 'Services',
    icon: Wrench,
    color: 'text-green-600',
  },
};

export default function CategoryBadge({ category, variant = 'secondary' }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <Badge 
      variant={variant} 
      className="flex items-center gap-1 text-xs"
      data-testid={`badge-category-${category}`}
    >
      <Icon className={`h-3 w-3 ${config.color}`} />
      {config.label}
    </Badge>
  );
}