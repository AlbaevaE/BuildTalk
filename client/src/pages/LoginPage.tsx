import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      if (response.ok) {
        window.location.href = '/';
      } else {
        const error = await response.json();
        alert(`Login failed: ${error.error}`);
      }
    } catch (error) {
      alert('Login failed: Network error');
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold text-foreground">
            BuildTalk
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Сообщество ремонтщиков
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Email/Password форма */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ваш пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full text-base font-medium"
              data-testid="button-login-email"
            >
              Войти
            </Button>
          </form>
          
          <p className="text-center text-sm text-muted-foreground">
            Присоединяйтесь к обсуждениям о ремонте, мебели и услугах
          </p>
        </CardContent>
      </Card>
    </div>
  );
}