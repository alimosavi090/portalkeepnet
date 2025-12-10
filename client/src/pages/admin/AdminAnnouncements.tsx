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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Bell, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Announcement, InsertAnnouncement } from '@shared/schema';

export default function AdminAnnouncements() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<InsertAnnouncement>({
    titleEn: '',
    titleFa: '',
    contentEn: '',
    contentFa: '',
    isActive: true,
  });

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/v1/announcements'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAnnouncement) => {
      return apiRequest('POST', '/api/v1/announcements', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/announcements'] });
      toast({ title: t('common.success'), description: 'Announcement created successfully' });
      closeDialog();
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to create announcement', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertAnnouncement }) => {
      return apiRequest('PATCH', `/api/v1/announcements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/announcements'] });
      toast({ title: t('common.success'), description: 'Announcement updated successfully' });
      closeDialog();
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to update announcement', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/v1/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/announcements'] });
      toast({ title: t('common.success'), description: 'Announcement deleted successfully' });
      setIsDeleteOpen(false);
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to delete announcement', variant: 'destructive' });
    },
  });

  const openCreateDialog = () => {
    setEditingAnnouncement(null);
    setFormData({
      titleEn: '',
      titleFa: '',
      contentEn: '',
      contentFa: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      titleEn: announcement.titleEn,
      titleFa: announcement.titleFa,
      contentEn: announcement.contentEn,
      contentFa: announcement.contentFa,
      isActive: announcement.isActive,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAnnouncement(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, data: formData });
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

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader title={t('admin.manageAnnouncements')}>
        <Button onClick={openCreateDialog} className="gap-2" data-testid="button-add-announcement">
          <Plus className="h-4 w-4" />
          {t('admin.add')}
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !announcements || announcements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No announcements yet"
          description="Create your first announcement to get started"
          action={
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('admin.add')}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} data-testid={`admin-announcement-${announcement.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant={announcement.isActive ? 'default' : 'secondary'}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">
                      {language === 'fa' ? announcement.titleFa : announcement.titleEn}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {language === 'fa' ? announcement.contentFa : announcement.contentEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(announcement)}
                      data-testid={`button-edit-announcement-${announcement.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(announcement.id)}
                      data-testid={`button-delete-announcement-${announcement.id}`}
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
              {editingAnnouncement ? t('admin.edit') : t('admin.add')} Announcement
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleEn">{t('admin.titleEn')}</Label>
                <Input
                  id="titleEn"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  required
                  data-testid="input-announcement-title-en"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleFa">{t('admin.titleFa')}</Label>
                <Input
                  id="titleFa"
                  value={formData.titleFa}
                  onChange={(e) => setFormData({ ...formData, titleFa: e.target.value })}
                  required
                  dir="rtl"
                  data-testid="input-announcement-title-fa"
                />
              </div>
            </div>

            <Tabs defaultValue="en" className="w-full">
              <TabsList>
                <TabsTrigger value="en">English Content</TabsTrigger>
                <TabsTrigger value="fa">Persian Content</TabsTrigger>
              </TabsList>
              <TabsContent value="en" className="space-y-2">
                <Label htmlFor="contentEn">{t('admin.contentEn')}</Label>
                <Textarea
                  id="contentEn"
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  rows={6}
                  required
                  placeholder="Write announcement content..."
                  data-testid="input-announcement-content-en"
                />
              </TabsContent>
              <TabsContent value="fa" className="space-y-2">
                <Label htmlFor="contentFa">{t('admin.contentFa')}</Label>
                <Textarea
                  id="contentFa"
                  value={formData.contentFa}
                  onChange={(e) => setFormData({ ...formData, contentFa: e.target.value })}
                  rows={6}
                  required
                  dir="rtl"
                  placeholder="محتوای اطلاعیه را بنویسید..."
                  data-testid="input-announcement-content-fa"
                />
              </TabsContent>
            </Tabs>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-announcement-active"
              />
              <Label htmlFor="isActive">{t('admin.active')}</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                {t('admin.cancel')}
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-announcement">
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
