import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useLanguage } from '@/lib/language';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Shield,
  ArrowRight,
  Bell,
  Smartphone,
  Monitor,
  Laptop,
  BookOpen,
  MessageCircle,
  Download,
  ChevronRight
} from 'lucide-react';
import { SiApple, SiAndroid, SiLinux } from 'react-icons/si';
import type { Platform, Announcement } from '@shared/schema';
import { format } from 'date-fns';

const platformIcons: Record<string, React.ReactNode> = {
  android: <SiAndroid className="h-8 w-8" />,
  ios: <SiApple className="h-8 w-8" />,
  windows: <Monitor className="h-8 w-8" />,
  macos: <SiApple className="h-8 w-8" />,
  linux: <SiLinux className="h-8 w-8" />,
  default: <Monitor className="h-8 w-8" />,
};

export default function Home() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data: announcements, isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/v1/announcements?active=true'],
  });

  const { data: platforms, isLoading: platformsLoading } = useQuery<Platform[]>({
    queryKey: ['/api/v1/platforms'],
  });

  const latestAnnouncements = announcements?.slice(0, 2) || [];

  return (
    <MainLayout>
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {t('home.welcome')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              {t('home.subtitle')}
            </p>
          </div>

          {/* Platform Cards - Main CTA */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">
              {t('home.platforms')}
            </h2>
            {platformsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : !platforms || platforms.length === 0 ? (
              <EmptyState
                icon={Laptop}
                title={t('platforms.noApps')}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {platforms.map((platform) => (
                  <Link key={platform.id} href={`/platforms/${platform.id}`}>
                    <Card className="hover-elevate cursor-pointer h-full transition-all hover:shadow-lg" data-testid={`card-platform-${platform.id}`}>
                      <CardContent className="flex flex-col items-center justify-center text-center p-8">
                        <div className="text-primary mb-4">
                          {platformIcons[platform.icon.toLowerCase()] || platformIcons.default}
                        </div>
                        <h3 className="font-semibold text-lg">
                          {language === 'fa' ? platform.nameFa : platform.nameEn}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold">{t('home.latestNews')}</h2>
            <Link href="/announcements">
              <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all-announcements">
                {t('home.viewAll')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {announcementsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : latestAnnouncements.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={t('home.noAnnouncements')}
              description={t('announcements.noAnnouncements')}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {latestAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="hover-elevate transition-all hover:shadow-md" data-testid={`card-announcement-${announcement.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">
                        {language === 'fa' ? announcement.titleFa : announcement.titleEn}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        {format(new Date(announcement.createdAt), 'MMM d')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {language === 'fa' ? announcement.contentFa : announcement.contentEn}
                    </p>
                    <Link href="/announcements">
                      <Button variant="link" className="px-0 mt-2" data-testid={`link-read-announcement-${announcement.id}`}>
                        {t('common.readMore')}
                        <ArrowRight className="h-4 w-4 ms-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8">{t('home.quickLinks')}</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/tutorials">
              <Card className="hover-elevate cursor-pointer h-full transition-all hover:shadow-md" data-testid="card-quick-tutorials">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('tutorials.title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('tutorials.subtitle')}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/bot-guide">
              <Card className="hover-elevate cursor-pointer h-full transition-all hover:shadow-md" data-testid="card-quick-bot-guide">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('nav.botGuide')}</h3>
                    <p className="text-sm text-muted-foreground">{t('tutorials.bot')}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contact">
              <Card className="hover-elevate cursor-pointer h-full transition-all hover:shadow-md" data-testid="card-quick-contact">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('nav.contact')}</h3>
                    <p className="text-sm text-muted-foreground">{t('contact.subtitle')}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
