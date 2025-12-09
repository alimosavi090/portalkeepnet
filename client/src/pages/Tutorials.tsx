import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import { useLanguage } from '@/lib/language';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  BookOpen, 
  Video, 
  FileText,
  ArrowLeft,
  Wrench
} from 'lucide-react';
import ReactPlayer from 'react-player';
import type { Tutorial } from '@shared/schema';

export default function Tutorials() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const params = useParams<{ id?: string }>();
  const tutorialId = params.id ? parseInt(params.id) : null;

  const { data: tutorials, isLoading } = useQuery<Tutorial[]>({
    queryKey: ['/api/v1/tutorials'],
  });

  const { data: tutorial, isLoading: tutorialLoading } = useQuery<Tutorial>({
    queryKey: ['/api/v1/tutorials', tutorialId],
    enabled: !!tutorialId,
  });

  if (isLoading || tutorialLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <LoadingPage message={t('common.loading')} />
        </div>
      </MainLayout>
    );
  }

  if (tutorialId && tutorial) {
    const content = language === 'fa' ? tutorial.contentFa : tutorial.contentEn;
    const title = language === 'fa' ? tutorial.titleFa : tutorial.titleEn;

    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <Link href="/tutorials">
            <Button variant="ghost" size="sm" className="mb-4 gap-2" data-testid="button-back-tutorials">
              <ArrowLeft className="h-4 w-4" />
              {t('tutorials.backToList')}
            </Button>
          </Link>

          <article>
            <div className="mb-6">
              <Badge variant="outline" className="mb-3">
                {tutorial.type === 'video' ? (
                  <><Video className="h-3 w-3 me-1" />{t('tutorials.videoGuide')}</>
                ) : (
                  <><FileText className="h-3 w-3 me-1" />{t('tutorials.textGuide')}</>
                )}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            </div>

            {tutorial.type === 'video' && tutorial.videoUrl && (
              <div className="aspect-video mb-8 rounded-lg overflow-hidden bg-muted">
                <ReactPlayer
                  url={tutorial.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  data-testid="video-player"
                />
              </div>
            )}

            {content && (
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
                data-testid="tutorial-content"
              />
            )}
          </article>
        </div>
      </MainLayout>
    );
  }

  const generalTutorials = tutorials?.filter(t => t.category === 'general') || [];
  const troubleshootingTutorials = tutorials?.filter(t => t.category === 'troubleshooting') || [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <PageHeader
          title={t('tutorials.title')}
          subtitle={t('tutorials.subtitle')}
        />

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general" className="gap-2" data-testid="tab-general">
              <BookOpen className="h-4 w-4" />
              {t('tutorials.general')}
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="gap-2" data-testid="tab-troubleshooting">
              <Wrench className="h-4 w-4" />
              {t('tutorials.troubleshooting')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {generalTutorials.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title={t('tutorials.noTutorials')}
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generalTutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} language={language} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="troubleshooting">
            {troubleshootingTutorials.length === 0 ? (
              <EmptyState
                icon={Wrench}
                title={t('tutorials.noTutorials')}
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {troubleshootingTutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} language={language} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function TutorialCard({ tutorial, language }: { tutorial: Tutorial; language: string }) {
  const { t } = useTranslation();
  
  return (
    <Link href={`/tutorials/${tutorial.id}`}>
      <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-tutorial-${tutorial.id}`}>
        <CardContent className="p-6">
          <Badge variant="outline" className="mb-3">
            {tutorial.type === 'video' ? (
              <><Video className="h-3 w-3 me-1" />{t('tutorials.videoGuide')}</>
            ) : (
              <><FileText className="h-3 w-3 me-1" />{t('tutorials.textGuide')}</>
            )}
          </Badge>
          <h3 className="font-semibold text-lg mb-2">
            {language === 'fa' ? tutorial.titleFa : tutorial.titleEn}
          </h3>
          <Button variant="link" className="px-0">
            {tutorial.type === 'video' ? t('tutorials.watchVideo') : t('tutorials.readMore')}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
