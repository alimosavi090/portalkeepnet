import { useTranslation } from 'react-i18next';
import { Shield, Heart } from 'lucide-react';
import { SiTelegram } from 'react-icons/si';
import { contactConfig, getContactUrls } from '@/config/contact';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const urls = getContactUrls();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-medium">VPN Support Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={urls.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-telegram"
            >
              <SiTelegram className="h-5 w-5" />
              <span className="text-sm">{contactConfig.telegram.channel}</span>
            </a>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>&copy; {currentYear}</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-destructive" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
