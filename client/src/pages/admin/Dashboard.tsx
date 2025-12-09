import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, Route, Switch } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading-spinner';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useTheme } from '@/lib/theme';
import { 
  LayoutDashboard, 
  Layers, 
  AppWindow, 
  BookOpen, 
  Bell, 
  Settings, 
  LogOut,
  Shield,
  Sun,
  Moon,
  Menu
} from 'lucide-react';
import type { Platform, Application, Tutorial, Announcement } from '@shared/schema';
import AdminPlatforms from './AdminPlatforms';
import AdminApplications from './AdminApplications';
import AdminTutorials from './AdminTutorials';
import AdminAnnouncements from './AdminAnnouncements';
import AdminSettings from './AdminSettings';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { admin, logout, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isRTL } = useLanguage();

  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ['/api/v1/platforms'],
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ['/api/v1/applications'],
  });

  const { data: tutorials } = useQuery<Tutorial[]>({
    queryKey: ['/api/v1/tutorials'],
  });

  const { data: announcements } = useQuery<Announcement[]>({
    queryKey: ['/api/v1/announcements'],
  });

  if (authLoading) {
    return <LoadingPage />;
  }

  if (!admin) {
    setLocation('/admin/login');
    return null;
  }

  const menuItems = [
    { href: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard },
    { href: '/admin/platforms', label: t('admin.managePlatforms'), icon: Layers },
    { href: '/admin/applications', label: t('admin.manageApps'), icon: AppWindow },
    { href: '/admin/tutorials', label: t('admin.manageTutorials'), icon: BookOpen },
    { href: '/admin/announcements', label: t('admin.manageAnnouncements'), icon: Bell },
    { href: '/admin/settings', label: t('admin.settings'), icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return location === '/admin';
    return location.startsWith(href);
  };

  const stats = [
    { label: t('admin.stats.platforms'), value: platforms?.length || 0, icon: Layers },
    { label: t('admin.stats.applications'), value: applications?.length || 0, icon: AppWindow },
    { label: t('admin.stats.tutorials'), value: tutorials?.length || 0, icon: BookOpen },
    { label: t('admin.stats.announcements'), value: announcements?.length || 0, icon: Bell },
  ];

  const sidebarStyle = {
    '--sidebar-width': '16rem',
    '--sidebar-width-icon': '3rem',
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full bg-background">
        <Sidebar side={isRTL ? 'right' : 'left'}>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold">{t('admin.title')}</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                      >
                        <Link href={item.href} data-testid={`admin-nav-${item.href.split('/').pop()}`}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground truncate">
                {admin.username}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  data-testid="admin-theme-toggle"
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  data-testid="admin-logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 h-14 border-b border-border px-4 bg-background shrink-0">
            <SidebarTrigger data-testid="admin-sidebar-trigger" />
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="admin-view-site">
                View Site
              </Button>
            </Link>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Switch>
              <Route path="/admin" component={() => (
                <DashboardHome stats={stats} />
              )} />
              <Route path="/admin/platforms" component={AdminPlatforms} />
              <Route path="/admin/applications" component={AdminApplications} />
              <Route path="/admin/tutorials" component={AdminTutorials} />
              <Route path="/admin/announcements" component={AdminAnnouncements} />
              <Route path="/admin/settings" component={AdminSettings} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function DashboardHome({ stats }: { stats: { label: string; value: number; icon: any }[] }) {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.dashboard')}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
