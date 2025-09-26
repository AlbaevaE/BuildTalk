import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          firstName: firstName || undefined, 
          lastName: lastName || undefined 
        }),
        credentials: 'include',
      });
      
      if (response.ok) {
        window.location.href = '/';
      } else {
        const error = await response.json();
        alert(`Регистрация не удалась: ${error.error}`);
      }
    } catch (error) {
      alert('Регистрация не удалась: Ошибка сети');
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
            Присоединяйтесь к сообществу ремонтщиков
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Ваше имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                data-testid="input-firstname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Ваша фамилия"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                data-testid="input-lastname"
              />
            </div>
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
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                data-testid="input-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full text-base font-medium"
              data-testid="button-register"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Зарегистрироваться
            </Button>
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Уже есть аккаунт? <Link href="/login"><span className="text-primary hover:underline cursor-pointer" data-testid="link-login">Войти</span></Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}