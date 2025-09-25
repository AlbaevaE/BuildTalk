import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold text-foreground">
            BuildTalk
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Сообщество строителей, мебельщиков и мастеров
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            asChild 
            className="w-full text-base font-medium"
            data-testid="button-login-replit"
          >
            <a href="/auth/login" className="flex items-center justify-center gap-3">
              <LogIn className="w-5 h-5" />
              Войти через Replit
            </a>
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            Присоединяйтесь к обсуждениям о строительстве, мебели и услугах
          </p>
        </CardContent>
      </Card>
    </div>
  );
}