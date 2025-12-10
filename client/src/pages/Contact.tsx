import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Send, Bot, MessageCircle } from 'lucide-react';
import { contactConfig, getContactUrls } from '@/config/contact';

export default function Contact() {
    const { t } = useTranslation();
    const urls = getContactUrls();

    const contactMethods = [
        {
            icon: Mail,
            title: t('contact.email'),
            value: contactConfig.email,
            description: t('contact.emailDesc'),
            href: urls.email,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            icon: Send,
            title: t('contact.telegramChannel'),
            value: contactConfig.telegram.channel,
            description: t('contact.channelDesc'),
            href: urls.telegramChannel,
            color: 'text-sky-500',
            bgColor: 'bg-sky-500/10',
        },
        {
            icon: MessageCircle,
            title: t('contact.telegramSupport'),
            value: contactConfig.telegram.support,
            description: t('contact.supportDesc'),
            href: urls.telegramSupport,
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-500/10',
        },
        {
            icon: Bot,
            title: t('contact.telegramBot'),
            value: contactConfig.telegram.bot,
            description: t('contact.botDesc'),
            href: urls.telegramBot,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
        },
    ];

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                <PageHeader
                    title={t('contact.title')}
                    subtitle={t('contact.subtitle')}
                />

                <div className="grid md:grid-cols-2 gap-6">
                    {contactMethods.map((method, index) => (
                        <Card key={index} className="hover-elevate">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${method.bgColor}`}>
                                        <method.icon className={`h-6 w-6 ${method.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg mb-1">
                                            {method.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {method.description}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                                {method.value}
                                            </code>
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                            >
                                                <a
                                                    href={method.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {t('contact.open')}
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="mt-8 bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">
                            {t('contact.responseTime')}
                        </h3>
                        <p className="text-muted-foreground">
                            {t('contact.responseTimeDesc')}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
