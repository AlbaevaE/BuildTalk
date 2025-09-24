import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageSquare, Star } from "lucide-react";
import heroImage from "@assets/generated_images/Construction_workshop_hero_image_48b154a3.png";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Construction workshop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />
      </div>

      {/* Hero Content */}
      <div className="relative px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
            data-testid="text-hero-title"
          >
            Общайтесь со Строительными Профессионалами
          </h1>
          <p 
            className="mt-6 text-lg leading-8 text-gray-100"
            data-testid="text-hero-description"
          >
            Присоединяйтесь к BuildTalk - ведущей платформе сообщества, где подрядчики, архитекторы, энтузиасты DIY и домовладельцы делятся знаниями, получают экспертные советы и строят вместе.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="gap-2 bg-primary hover:bg-primary/90 backdrop-blur-sm"
              data-testid="button-get-started"
            >
              Начать
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              data-testid="button-learn-more"
            >
              Узнать больше
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Users className="h-6 w-6" />
                <span className="text-2xl font-bold text-white">10K+</span>
              </div>
              <p className="mt-1 text-sm text-gray-200">Активных участников</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-primary">
                <MessageSquare className="h-6 w-6" />
                <span className="text-2xl font-bold text-white">50К+</span>
              </div>
              <p className="mt-1 text-sm text-gray-200">Обсуждений</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Star className="h-6 w-6" />
                <span className="text-2xl font-bold text-white">4.9</span>
              </div>
              <p className="mt-1 text-sm text-gray-200">Рейтинг пользователей</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}