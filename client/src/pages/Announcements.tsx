import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/language';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Bell, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Announcement } from '@shared/schema';

// --- تابع جدید برای تبدیل متن لینک‌دار به لینک واقعی ---
const renderContentWithLinks = (text: string | null | undefined) => {
  if (!text) return null;

  // این الگو دنبال آدرس‌هایی میگرده که با http یا https شروع میشن
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // متن رو تیکه تیکه میکنیم (لینک‌ها و متن‌های معمولی)
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    // اگه این تیکه شبیه لینک بود، داخل تگ <a> بذارش
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium break-all"
          onClick={(e) => e.stopPropagation()} // جلوگیری از تداخل با کلیک کارت
        >
          {part}
        </a>
      );
    }
    // اگه متن معمولی بود، خودش رو برگردون
    return part;
  });
};

export default function Announcements() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/v1/announcements'],
  });

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
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <PageHeader
          title={t('announcements.title')}
          subtitle={t('announcements.subtitle')}
        />

        {!announcements || announcements.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t('announcements.noAnnouncements')}
          />
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id} data-testid={`card-announcement-${announcement.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <CardTitle className="text-xl">
                      {language === 'fa' ? announcement.titleFa : announcement.titleEn}
                    </CardTitle>
                    <Badge variant="secondary" className="gap-1 shrink-0">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap"
                    data-testid={`content-announcement-${announcement.id}`}
                  >
                    {/* استفاده از تابع جدید برای نمایش متن */}
                    {renderContentWithLinks(
                      language === 'fa' ? announcement.contentFa : announcement.contentEn
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
