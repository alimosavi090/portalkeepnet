import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import { useLanguage } from '@/lib/language';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  Monitor, 
  Download, 
  ArrowLeft,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { SiApple, SiAndroid, SiLinux } from 'react-icons/si';
import type { Platform, Application, Tutorial } from '@shared/schema';

const platformIcons: Record<string, React.ReactNode> = {
  android: <SiAndroid className="h-10 w-10" />,
  ios: <SiApple className="h-10 w-10" />,
  windows: <Monitor className="h-10 w-10" />,
  macos: <SiApple className="h-10 w-10" />,
  linux: <SiLinux className="h-10 w-10" />,
  default: <Monitor className="h-10 w-10" />,
};

export default function Platforms() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const params = useParams<{ id?: string }>();
  const platformId = params.id ? parseInt(params.id) : null;

  const { data: platforms, isLoading: platformsLoading } = useQuery<Platform[]>({
    queryKey: ['/api/v1/platforms'],
  });

  const { data: applications, isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: [`/api/v1/applications?platformId=${platformId}`],
    enabled: !!platformId,
  });

  const { data: tutorials } = useQuery<Tutorial[]>({
    queryKey: [`/api/v1/tutorials?platformId=${platformId}`],
    enabled: !!platformId,
  });

  if (platformsLoading || (platformId && appsLoading)) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <LoadingPage message={t('common.loading')} />
        </div>
      </MainLayout>
    );
  }

  const currentPlatform = platforms?.find(p => p.id === platformId);
  const platformTutorials = tutorials?.filter(t => t.platformId === platformId) || [];

  if (platformId && currentPlatform) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Link href="/platforms">
            <Button variant="ghost" size="sm" className="mb-4 gap-2" data-testid="button-back-platforms">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="text-primary">
              {platformIcons[currentPlatform.icon.toLowerCase()] || platformIcons.default}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {language === 'fa' ? currentPlatform.nameFa : currentPlatform.nameEn}
              </h1>
              <p className="text-muted-foreground">{t('platforms.subtitle')}</p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              {t('platforms.apps')}
            </h2>

            {!applications || applications.length === 0 ? (
              <EmptyState
                icon={Download}
                title={t('platforms.noApps')}
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {applications.map((app) => (
                  <Card key={app.id} data-testid={`card-app-${app.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {language === 'fa' ? app.nameFa : app.nameEn}
                          </h3>
                          {app.version && (
                            <Badge variant="secondary" className="mb-2">
                              {t('platforms.version')}: {app.version}
                            </Badge>
                          )}
                          {(app.descriptionEn || app.descriptionFa) && (
                            <p className="text-muted-foreground text-sm">
                              {language === 'fa' ? app.descriptionFa : app.descriptionEn}
                            </p>
                          )}
                        </div>
                        <a 
                          href={app.downloadLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button className="gap-2 shrink-0" data-testid={`button-download-${app.id}`}>
                            <Download className="h-4 w-4" />
                            {t('platforms.download')}
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {platformTutorials.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {t('platforms.tutorials')}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformTutorials.map((tutorial) => (
                  <Link key={tutorial.id} href={`/tutorials/${tutorial.id}`}>
                    <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-tutorial-${tutorial.id}`}>
                      <CardContent className="p-4">
                        <Badge variant="outline" className="mb-2">
                          {tutorial.type === 'video' ? t('tutorials.videoGuide') : t('tutorials.textGuide')}
                        </Badge>
                        <h3 className="font-medium">
                          {language === 'fa' ? tutorial.titleFa : tutorial.titleEn}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <PageHeader
          title={t('platforms.title')}
          subtitle={t('platforms.subtitle')}
        />

        {!platforms || platforms.length === 0 ? (
          <EmptyState
            icon={Monitor}
            title={t('platforms.noApps')}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {platforms.map((platform) => (
              <Link key={platform.id} href={`/platforms/${platform.id}`}>
                <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-platform-${platform.id}`}>
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
    </MainLayout>
  );
}
