import { useQuery } from "@tanstack/react-query";
import { User, Settings, Award, BarChart3, MessageSquare, Calendar, Eye, Wrench, Hammer, Cog, Briefcase, HardHat, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

// Типы для профиля пользователя
interface ProfileData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
  karma: number;
  role: string | null;
  bio: string | null;
  isProfilePublic: boolean;
  createdAt: Date | string;
  threadsCount: number;
  commentsCount: number;
  bestAnswersCount: number;
  achievements?: Array<{ name: string; requirement: number; earned: boolean }>;
  nextAchievement?: { name: string; requirement: number; earned: boolean };
}

// Система достижений
const achievements = [
  { name: "Что-то понимающий", icon: Wrench, requirement: 10, description: "10+ положительных реакций" },
  { name: "Можно доверять", icon: Hammer, requirement: 30, description: "30+ положительных реакций" },
  { name: "Отвечает по делу", icon: Cog, requirement: 50, description: "50+ положительных реакций" },
  { name: "Эксперт по ремонту", icon: Briefcase, requirement: 100, description: "100+ положительных реакций" },
  { name: "Мастер на все руки", icon: Settings, requirement: 300, description: "300+ положительных реакций" },
  { name: "Прораб", icon: HardHat, requirement: 500, description: "500+ положительных реакций" },
  { name: "Гуру ремонта", icon: Trophy, requirement: 1000, description: "1000+ положительных реакций" }
];

// Достижения за активность
const activityAchievements = [
  { name: "Новосёл", description: "Создал первую тему", earned: true },
  { name: "Сосед по форуму", description: "10+ комментариев", earned: true },
  { name: "Старожил", description: "100+ комментариев", earned: false },
  { name: "Подсказал соседу", description: "Первый лучший ответ", earned: true },
  { name: "Советчик", description: "10 лучших ответов", earned: true },
  { name: "Наставник", description: "50 лучших ответов", earned: false }
];

export default function ProfilePage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  
  const { data: profileData, isLoading: profileLoading, error } = useQuery<ProfileData>({
    queryKey: ['/api/profile'],
    enabled: !!authUser
  });

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">Ошибка загрузки профиля</h2>
            <p className="text-muted-foreground">Не удалось загрузить данные профиля</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = profileData;
  
  // Определяем текущий уровень на основе кармы
  const currentAchievement = achievements
    .filter(achievement => user.karma >= achievement.requirement)
    .pop();
  
  const nextAchievement = achievements
    .find(achievement => user.karma < achievement.requirement);

  // Стаж на форуме
  const yearsOnForum = Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365));
  
  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${(firstName || 'U').charAt(0)}${(lastName || 'U').charAt(0)}`.toUpperCase();
  };

  const getRoleLabel = (role: string | null) => {
    const roleLabels = {
      contractor: "Подрядчик",
      homeowner: "Домовладелец", 
      supplier: "Поставщик",
      architect: "Архитектор",
      diy: "Самоделкин"
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Заголовок профиля */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Личный кабинет</h1>
        <Button 
          variant="outline" 
          className="gap-2"
          data-testid="button-edit-profile"
        >
          <Settings className="h-4 w-4" />
          Редактировать
        </Button>
      </div>

      {/* Основная информация профиля */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="text-lg bg-muted">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground" data-testid="user-name">
                  {user.firstName} {user.lastName}
                </h2>
                <Badge variant="secondary" className="text-xs" data-testid="user-role">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>На форуме {yearsOnForum} {yearsOnForum === 1 ? 'год' : yearsOnForum < 5 ? 'года' : 'лет'}</span>
              </div>
              
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Метрики и статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-foreground" data-testid="metric-karma">{user.karma}</div>
            <div className="text-sm text-muted-foreground">Карма</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground" data-testid="metric-threads">{user.threadsCount}</div>
            <div className="text-sm text-muted-foreground">Публикации</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-foreground" data-testid="metric-comments">{user.commentsCount}</div>
            <div className="text-sm text-muted-foreground">Комментарии</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-foreground" data-testid="metric-best-answers">{user.bestAnswersCount}</div>
            <div className="text-sm text-muted-foreground">Лучшие ответы</div>
          </CardContent>
        </Card>
      </div>

      {/* Достижения */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Достижения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Текущий уровень */}
          {currentAchievement && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <currentAchievement.icon className="h-6 w-6 text-orange-600" />
              <div>
                <div className="font-medium text-foreground">{currentAchievement.name}</div>
                <div className="text-sm text-muted-foreground">{currentAchievement.description}</div>
              </div>
              <Badge className="ml-auto bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                Текущий уровень
              </Badge>
            </div>
          )}
          
          {/* Следующий уровень */}
          {nextAchievement && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <nextAchievement.icon className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium text-foreground">{nextAchievement.name}</div>
                <div className="text-sm text-muted-foreground">{nextAchievement.description}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Прогресс: {user.karma} / {nextAchievement.requirement}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Осталось: {nextAchievement.requirement - user.karma}
              </div>
            </div>
          )}

          <Separator />

          {/* Достижения за активность */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Достижения за активность</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activityAchievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    achievement.earned 
                      ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' 
                      : 'bg-muted/30 border border-border'
                  }`}
                >
                  <Award className={`h-4 w-4 ${
                    achievement.earned ? 'text-green-600' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                  {achievement.earned && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Получено
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium text-foreground">Профиль</div>
                <div className="text-sm text-muted-foreground">Настроить данные профиля</div>
              </div>
            </div>
            <Button variant="outline" size="sm" data-testid="button-profile-settings">
              Настроить
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium text-foreground">Видимость профиля</div>
                <div className="text-sm text-muted-foreground">
                  {user.isProfilePublic ? 'Профиль виден всем' : 'Профиль скрыт'}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" data-testid="button-privacy-settings">
              Изменить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}