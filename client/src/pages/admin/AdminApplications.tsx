import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/lib/language';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, AppWindow, Loader2, ExternalLink } from 'lucide-react';
import type { Application, InsertApplication, Platform } from '@shared/schema';

export default function AdminApplications() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<InsertApplication>({
    platformId: 0,
    nameEn: '',
    nameFa: '',
    descriptionEn: '',
    descriptionFa: '',
    downloadLink: '',
    version: '',
    order: 0,
  });

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['/api/v1/applications'],
  });

  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ['/api/v1/platforms'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertApplication) => {
      return apiRequest('POST', '/api/v1/applications', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/applications'] });
      toast({ title: t('common.success'), description: 'Application created successfully' });
      closeDialog();
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to create application', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertApplication }) => {
      return apiRequest('PATCH', `/api/v1/applications/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/applications'] });
      toast({ title: t('common.success'), description: 'Application updated successfully' });
      closeDialog();
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to update application', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/v1/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/applications'] });
      toast({ title: t('common.success'), description: 'Application deleted successfully' });
      setIsDeleteOpen(false);
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to delete application', variant: 'destructive' });
    },
  });

  const openCreateDialog = () => {
    setEditingApp(null);
    setFormData({
      platformId: platforms?.[0]?.id || 0,
      nameEn: '',
      nameFa: '',
      descriptionEn: '',
      descriptionFa: '',
      downloadLink: '',
      version: '',
      order: 0,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (app: Application) => {
    setEditingApp(app);
    setFormData({
      platformId: app.platformId,
      nameEn: app.nameEn,
      nameFa: app.nameFa,
      descriptionEn: app.descriptionEn || '',
      descriptionFa: app.descriptionFa || '',
      downloadLink: app.downloadLink,
      version: app.version || '',
      order: app.order,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingApp(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApp) {
      updateMutation.mutate({ id: editingApp.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  const getPlatformName = (platformId: number) => {
    const platform = platforms?.find(p => p.id === platformId);
    return platform ? (language === 'fa' ? platform.nameFa : platform.nameEn) : 'Unknown';
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader title={t('admin.manageApps')}>
        <Button onClick={openCreateDialog} className="gap-2" data-testid="button-add-application">
          <Plus className="h-4 w-4" />
          {t('admin.add')}
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !applications || applications.length === 0 ? (
        <EmptyState
          icon={AppWindow}
          title="No applications yet"
          description="Create your first application to get started"
          action={
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('admin.add')}
            </Button>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <Card key={app.id} data-testid={`admin-app-${app.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {language === 'fa' ? app.nameFa : app.nameEn}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getPlatformName(app.platformId)} {app.version && `• v${app.version}`}
                    </p>
                    <a
                      href={app.downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Download Link
                    </a>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(app)}
                      data-testid={`button-edit-app-${app.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(app.id)}
                      data-testid={`button-delete-app-${app.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingApp ? t('admin.edit') : t('admin.add')} Application
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformId">{t('admin.platform')}</Label>
              <Select
                value={String(formData.platformId)}
                onValueChange={(value) => setFormData({ ...formData, platformId: parseInt(value) })}
              >
                <SelectTrigger data-testid="select-app-platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms?.map((platform) => (
                    <SelectItem key={platform.id} value={String(platform.id)}>
                      {language === 'fa' ? platform.nameFa : platform.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameEn">{t('admin.nameEn')}</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  required
                  data-testid="input-app-name-en"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameFa">{t('admin.nameFa')}</Label>
                <Input
                  id="nameFa"
                  value={formData.nameFa}
                  onChange={(e) => setFormData({ ...formData, nameFa: e.target.value })}
                  required
                  dir="rtl"
                  data-testid="input-app-name-fa"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="downloadLink">{t('admin.downloadLink')}</Label>
              <Input
                id="downloadLink"
                value={formData.downloadLink}
                onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
                required
                placeholder="https://..."
                data-testid="input-app-download-link"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version || ''}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                  data-testid="input-app-version"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">{t('admin.order')}</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  data-testid="input-app-order"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{t('admin.descriptionEn')}</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn || ''}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                rows={2}
                data-testid="input-app-description-en"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionFa">{t('admin.descriptionFa')}</Label>
              <Textarea
                id="descriptionFa"
                value={formData.descriptionFa || ''}
                onChange={(e) => setFormData({ ...formData, descriptionFa: e.target.value })}
                rows={2}
                dir="rtl"
                data-testid="input-app-description-fa"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                {t('admin.cancel')}
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-app">
                {isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                {t('admin.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.confirmDelete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              {t('admin.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
