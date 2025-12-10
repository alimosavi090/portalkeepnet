import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useLanguage } from '@/lib/language';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  MessageCircle, 
  Video, 
  FileText,
  ShoppingCart,
  RefreshCw,
  Settings,
  HelpCircle
} from 'lucide-react';
import type { Tutorial } from '@shared/schema';

const categoryIcons: Record<string, React.ReactNode> = {
  buying: <ShoppingCart className="h-5 w-5" />,
  renewal: <RefreshCw className="h-5 w-5" />,
  configuration: <Settings className="h-5 w-5" />,
  default: <HelpCircle className="h-5 w-5" />,
};

export default function BotGuide() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data: tutorials, isLoading } = useQuery<Tutorial[]>({
    queryKey: ['/api/v1/tutorials', { category: 'bot' }],
  });

  const botTutorials = tutorials?.filter(t => t.category === 'bot') || [];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <LoadingPage message={t('common.loading')} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <PageHeader
          title={t('nav.botGuide')}
          subtitle={t('tutorials.bot')}
        />

        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{t('tutorials.bot')}</h2>
              <p className="text-muted-foreground text-sm">
                {language === 'fa' 
                  ? 'راهنمای کامل استفاده از ربات تلگرام برای خرید، تمدید و تنظیمات' 
                  : 'Complete guide to using the Telegram bot for purchases, renewals, and configurations'}
              </p>
            </div>
          </div>
        </div>

        {botTutorials.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title={t('tutorials.noTutorials')}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {botTutorials.map((tutorial) => (
              <Link key={tutorial.id} href={`/tutorials/${tutorial.id}`}>
                <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-bot-tutorial-${tutorial.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">
                        {tutorial.type === 'video' ? (
                          <><Video className="h-3 w-3 me-1" />{t('tutorials.videoGuide')}</>
                        ) : (
                          <><FileText className="h-3 w-3 me-1" />{t('tutorials.textGuide')}</>
                        )}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {language === 'fa' ? tutorial.titleFa : tutorial.titleEn}
                    </h3>
                    <Button variant="link" className="px-0">
                      {tutorial.type === 'video' ? t('tutorials.watchVideo') : t('tutorials.readMore')}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
