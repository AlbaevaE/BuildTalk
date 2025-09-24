import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserAvatarProps {
  name: string;
  role: 'contractor' | 'homeowner' | 'supplier' | 'architect' | 'diy';
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
  showRole?: boolean;
}

const roleColors = {
  contractor: 'bg-primary text-primary-foreground',
  homeowner: 'bg-blue-500 text-white',
  supplier: 'bg-green-500 text-white',
  architect: 'bg-purple-500 text-white',
  diy: 'bg-orange-500 text-white',
};

const roleLabels = {
  contractor: 'Pro',
  homeowner: 'Home',
  supplier: 'Supplier',
  architect: 'Architect',
  diy: 'DIY',
};

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function UserAvatar({ name, role, avatar, size = 'md', showRole = false }: UserAvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center gap-2">
      <Avatar className={sizeClasses[size]} data-testid={`avatar-${name.toLowerCase().replace(' ', '-')}`}>
        {avatar && <AvatarImage src={avatar} alt={name} />}
        <AvatarFallback className={roleColors[role]}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {showRole && (
        <Badge variant="secondary" className="text-xs" data-testid={`badge-role-${role}`}>
          {roleLabels[role]}
        </Badge>
      )}
    </div>
  );
}