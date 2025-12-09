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
import { Plus, Pencil, Trash2, Layers, Loader2 } from 'lucide-react';
import type { Platform, InsertPlatform } from '@shared/schema';

const iconOptions = ['android', 'ios', 'windows', 'macos', 'linux', 'default'];

export default function AdminPlatforms() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<InsertPlatform>({
    nameEn: '',
    nameFa: '',
    icon: 'default',
    order: 0,
  });

  const { data: platforms, isLoading } = useQuery<Platform[]>({
    queryKey: ['/api/v1/platforms'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPlatform) => {
      return apiRequest('POST', '/api/v1/platforms', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/platforms'] });
      toast({ title: t('common.success'), description: 'Platform created successfully' });
      closeDialog();
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to create platform', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertPlatform }) => {
      return apiRequest('PATCH', `/api/v1/platforms/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/platforms'] });
      toast({ title: t('common.success'), description: 'Platform updated successfully' });
      closeDialog();
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to update platform', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/v1/platforms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/platforms'] });
      toast({ title: t('common.success'), description: 'Platform deleted successfully' });
      setIsDeleteOpen(false);
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to delete platform', variant: 'destructive' });
    },
  });

  const openCreateDialog = () => {
    setEditingPlatform(null);
    setFormData({ nameEn: '', nameFa: '', icon: 'default', order: 0 });
    setIsDialogOpen(true);
  };

  const openEditDialog = (platform: Platform) => {
    setEditingPlatform(platform);
    setFormData({
      nameEn: platform.nameEn,
      nameFa: platform.nameFa,
      icon: platform.icon,
      order: platform.order,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPlatform(null);
    setFormData({ nameEn: '', nameFa: '', icon: 'default', order: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlatform) {
      updateMutation.mutate({ id: editingPlatform.id, data: formData });
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
      <PageHeader title={t('admin.managePlatforms')}>
        <Button onClick={openCreateDialog} className="gap-2" data-testid="button-add-platform">
          <Plus className="h-4 w-4" />
          {t('admin.add')}
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !platforms || platforms.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No platforms yet"
          description="Create your first platform to get started"
          action={
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('admin.add')}
            </Button>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <Card key={platform.id} data-testid={`admin-platform-${platform.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">
                      {language === 'fa' ? platform.nameFa : platform.nameEn}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Icon: {platform.icon} | Order: {platform.order}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(platform)}
                      data-testid={`button-edit-platform-${platform.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(platform.id)}
                      data-testid={`button-delete-platform-${platform.id}`}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlatform ? t('admin.edit') : t('admin.add')} Platform
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nameEn">{t('admin.nameEn')}</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                required
                data-testid="input-platform-name-en"
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
                data-testid="input-platform-name-fa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">{t('admin.icon')}</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger data-testid="select-platform-icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">{t('admin.order')}</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                data-testid="input-platform-order"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                {t('admin.cancel')}
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-platform">
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
