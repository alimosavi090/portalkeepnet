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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, BookOpen, Loader2, Video, FileText } from 'lucide-react';
import { ImageUploader } from '@/components/ui/image-uploader';
import type { Tutorial, InsertTutorial, Platform, Application } from '@shared/schema';

const typeOptions = ['text', 'video'] as const;
const categoryOptions = ['general', 'bot', 'troubleshooting'] as const;

export default function AdminTutorials() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<InsertTutorial>({
    type: 'text',
    category: 'general',
    titleEn: '',
    titleFa: '',
    contentEn: '',
    contentFa: '',
    videoUrl: '',
    images: [],
    platformId: null,
    appId: null,
    order: 0,
  });

  const { data: tutorials, isLoading } = useQuery<Tutorial[]>({
    queryKey: ['/api/v1/tutorials'],
  });

  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ['/api/v1/platforms'],
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ['/api/v1/applications'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTutorial) => {
      return apiRequest('POST', '/api/v1/tutorials', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/tutorials'] });
      toast({ title: t('common.success'), description: 'Tutorial created successfully' });
      closeDialog();
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to create tutorial', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertTutorial }) => {
      return apiRequest('PATCH', `/api/v1/tutorials/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/tutorials'] });
      toast({ title: t('common.success'), description: 'Tutorial updated successfully' });
      closeDialog();
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to update tutorial', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/v1/tutorials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/tutorials'] });
      toast({ title: t('common.success'), description: 'Tutorial deleted successfully' });
      setIsDeleteOpen(false);
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: t('common.error'), description: 'Failed to delete tutorial', variant: 'destructive' });
    },
  });

  const openCreateDialog = () => {
    setEditingTutorial(null);
    setFormData({
      type: 'text',
      category: 'general',
      titleEn: '',
      titleFa: '',
      contentEn: '',
      contentFa: '',
      videoUrl: '',
      images: [],
      platformId: null,
      appId: null,
      order: 0,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      type: tutorial.type as 'text' | 'video',
      category: tutorial.category as 'general' | 'bot' | 'troubleshooting',
      titleEn: tutorial.titleEn,
      titleFa: tutorial.titleFa,
      contentEn: tutorial.contentEn || '',
      contentFa: tutorial.contentFa || '',
      videoUrl: tutorial.videoUrl || '',
      images: tutorial.images || [],
      platformId: tutorial.platformId,
      appId: tutorial.appId,
      order: tutorial.order,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTutorial(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTutorial) {
      updateMutation.mutate({ id: editingTutorial.id, data: formData });
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'general': return t('tutorials.general');
      case 'bot': return t('tutorials.bot');
      case 'troubleshooting': return t('tutorials.troubleshooting');
      default: return category;
    }
  };

  return (
    <div>
      <PageHeader title={t('admin.manageTutorials')}>
        <Button onClick={openCreateDialog} className="gap-2" data-testid="button-add-tutorial">
          <Plus className="h-4 w-4" />
          {t('admin.add')}
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !tutorials || tutorials.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No tutorials yet"
          description="Create your first tutorial to get started"
          action={
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('admin.add')}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id} data-testid={`admin-tutorial-${tutorial.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline">
                        {tutorial.type === 'video' ? (
                          <><Video className="h-3 w-3 me-1" />Video</>
                        ) : (
                          <><FileText className="h-3 w-3 me-1" />Text</>
                        )}
                      </Badge>
                      <Badge variant="secondary">
                        {getCategoryLabel(tutorial.category)}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">
                      {language === 'fa' ? tutorial.titleFa : tutorial.titleEn}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(tutorial)}
                      data-testid={`button-edit-tutorial-${tutorial.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tutorial.id)}
                      data-testid={`button-delete-tutorial-${tutorial.id}`}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTutorial ? t('admin.edit') : t('admin.add')} Tutorial
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">{t('admin.type')}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'text' | 'video') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger data-testid="select-tutorial-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === 'video' ? 'Video' : 'Text'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t('admin.category')}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: 'general' | 'bot' | 'troubleshooting') => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="select-tutorial-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {getCategoryLabel(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleEn">{t('admin.titleEn')}</Label>
                <Input
                  id="titleEn"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  required
                  data-testid="input-tutorial-title-en"
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
                  data-testid="input-tutorial-title-fa"
                />
              </div>
            </div>

            {formData.type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="videoUrl">{t('admin.videoUrl')}</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  data-testid="input-tutorial-video-url"
                />
              </div>
            )}

            <Tabs defaultValue="en" className="w-full">
              <TabsList>
                <TabsTrigger value="en">English Content</TabsTrigger>
                <TabsTrigger value="fa">Persian Content</TabsTrigger>
              </TabsList>
              <TabsContent value="en" className="space-y-2">
                <Label htmlFor="contentEn">{t('admin.contentEn')}</Label>
                <Textarea
                  id="contentEn"
                  value={formData.contentEn || ''}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  rows={8}
                  placeholder="Write tutorial content in HTML or plain text..."
                  data-testid="input-tutorial-content-en"
                />
              </TabsContent>
              <TabsContent value="fa" className="space-y-2">
                <Label htmlFor="contentFa">{t('admin.contentFa')}</Label>
                <Textarea
                  id="contentFa"
                  value={formData.contentFa || ''}
                  onChange={(e) => setFormData({ ...formData, contentFa: e.target.value })}
                  rows={8}
                  dir="rtl"
                  placeholder="محتوای آموزش را به صورت HTML یا متن ساده بنویسید..."
                  data-testid="input-tutorial-content-fa"
                />
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platformId">{t('admin.platform')} (optional)</Label>
                <Select
                  value={formData.platformId ? String(formData.platformId) : 'none'}
                  onValueChange={(value) => setFormData({ ...formData, platformId: value === 'none' ? null : parseInt(value) })}
                >
                  <SelectTrigger data-testid="select-tutorial-platform">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {platforms?.map((platform) => (
                      <SelectItem key={platform.id} value={String(platform.id)}>
                        {language === 'fa' ? platform.nameFa : platform.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appId">{t('admin.application')} (optional)</Label>
                <Select
                  value={formData.appId ? String(formData.appId) : 'none'}
                  onValueChange={(value) => setFormData({ ...formData, appId: value === 'none' ? null : parseInt(value) })}
                >
                  <SelectTrigger data-testid="select-tutorial-app">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {applications?.map((app) => (
                      <SelectItem key={app.id} value={String(app.id)}>
                        {language === 'fa' ? app.nameFa : app.nameEn}
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
                  data-testid="input-tutorial-order"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tutorial Images</Label>
              <ImageUploader
                images={formData.images || []}
                onImagesChange={(images) => setFormData({ ...formData, images })}
                maxImages={5}
                disabled={isPending}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                {t('admin.cancel')}
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-tutorial">
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
