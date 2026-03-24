import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Trash2, Bell, SendHorizonal } from 'lucide-react';
import { getTodo, deleteTodo, deleteReminder, notifyReminder } from '@/lib/api';
import type { TodoStatus, TodoContext, Reminder } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TodoForm from './TodoForm';

const queryClient = new QueryClient();

const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: '대기',
  in_progress: '진행중',
  done: '완료',
};

const CONTEXT_LABELS: Record<TodoContext, string> = {
  none: '없음',
  work: '업무',
  home: '가정',
};

const OFFSET_UNIT_LABELS: Record<string, string> = {
  minute: '분',
  hour: '시간',
  day: '일',
};

interface Props {
  id: string;
}

function TodoDetailContent({ id }: Props) {
  const qc = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const [reminderToNotify, setReminderToNotify] = useState<string | null>(null);

  const { data: todo, isLoading, isError } = useQuery({
    queryKey: ['todo', id],
    queryFn: () => getTodo(id),
  });

  const deleteTodoMutation = useMutation({
    mutationFn: () => deleteTodo(id),
    onSuccess: () => {
      toast.success('할일이 삭제되었습니다.');
      qc.invalidateQueries({ queryKey: ['todos'] });
      window.location.href = '/todo';
    },
    onError: () => {
      toast.error('할일 삭제에 실패했습니다.');
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (reminderId: string) => deleteReminder(id, reminderId),
    onSuccess: () => {
      toast.success('알림이 삭제되었습니다.');
      qc.invalidateQueries({ queryKey: ['todo', id] });
      setReminderToDelete(null);
    },
    onError: () => {
      toast.error('알림 삭제에 실패했습니다.');
    },
  });

  const notifyReminderMutation = useMutation({
    mutationFn: (reminderId: string) => notifyReminder(id, reminderId),
    onSuccess: () => {
      toast.success('알림이 강제 발송되었습니다.');
      qc.invalidateQueries({ queryKey: ['todo', id] });
      setReminderToNotify(null);
    },
    onError: () => {
      toast.error('알림 강제 발송에 실패했습니다.');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (isError || !todo) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" onClick={() => (window.location.href = '/todo')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-destructive">할일을 불러오는 데 실패했습니다.</p>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => setIsEditMode(false)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          취소
        </Button>
        <TodoForm id={id} />
      </div>
    );
  }

  const isPending = (reminder: Reminder) => reminder.notifiedAt === null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => (window.location.href = '/todo')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">할일 상세</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditMode(true)}>
            <Edit className="h-4 w-4 mr-2" />
            수정
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </Button>
        </div>
      </div>

      {/* Todo info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">제목</p>
            <p className="text-lg font-medium">{todo.title}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">상태</p>
              <Badge variant={`status-${todo.status}` as VariantProps<typeof badgeVariants>['variant']}>
                {STATUS_LABELS[todo.status]}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">컨텍스트</p>
              <Badge variant={`context-${todo.context}` as VariantProps<typeof badgeVariants>['variant']}>
                {CONTEXT_LABELS[todo.context]}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">마감일</p>
              <p className="text-sm">
                {todo.dueDate
                  ? format(new Date(todo.dueDate), 'yyyy-MM-dd', { locale: ko })
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">생성일</p>
              <p className="text-sm">
                {format(new Date(todo.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">완료일</p>
              <p className="text-sm">
                {todo.doneAt
                  ? format(new Date(todo.doneAt), 'yyyy-MM-dd HH:mm', { locale: ko })
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            알림 ({todo.reminders.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todo.reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground">등록된 알림이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">알림 시점</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">발송 예정일시</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">상태</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">발송일시</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {todo.reminders.map((reminder) => (
                    <tr key={reminder.id} className="border-b">
                      <td className="px-3 py-2">
                        {reminder.offsetValue}{OFFSET_UNIT_LABELS[reminder.offsetUnit]} 전
                      </td>
                      <td className="px-3 py-2">
                        {format(new Date(reminder.remindAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={isPending(reminder) ? 'reminder-pending' : 'reminder-sent'}>
                          {isPending(reminder) ? '대기' : '발송완료'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        {reminder.notifiedAt
                          ? format(new Date(reminder.notifiedAt), 'yyyy-MM-dd HH:mm', { locale: ko })
                          : '-'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {isPending(reminder) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReminderToNotify(reminder.id)}
                            >
                              <SendHorizonal className="h-3.5 w-3.5 mr-1" />
                              강제 발송
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReminderToDelete(reminder.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete todo dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>할일 삭제</DialogTitle>
            <DialogDescription>
              "{todo.title}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTodoMutation.mutate()}
              disabled={deleteTodoMutation.isPending}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete reminder dialog */}
      <Dialog open={reminderToDelete !== null} onOpenChange={(open) => !open && setReminderToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림 삭제</DialogTitle>
            <DialogDescription>이 알림을 삭제하시겠습니까?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderToDelete(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => reminderToDelete && deleteReminderMutation.mutate(reminderToDelete)}
              disabled={deleteReminderMutation.isPending}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force notify dialog */}
      <Dialog open={reminderToNotify !== null} onOpenChange={(open) => !open && setReminderToNotify(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림 강제 발송</DialogTitle>
            <DialogDescription>이 알림을 지금 강제 발송하시겠습니까?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderToNotify(null)}>
              취소
            </Button>
            <Button
              onClick={() => reminderToNotify && notifyReminderMutation.mutate(reminderToNotify)}
              disabled={notifyReminderMutation.isPending}
            >
              발송
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TodoDetail({ id }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoDetailContent id={id} />
    </QueryClientProvider>
  );
}
