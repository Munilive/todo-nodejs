import { useState, useEffect } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { getTodo, createTodo, updateTodo } from '@/lib/api';
import type { TodoStatus, TodoContext, ReminderOffsetUnit, ReminderInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const queryClient = new QueryClient();

interface Props {
  id?: string;
}

function TodoFormContent({ id }: Props) {
  const qc = useQueryClient();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TodoStatus>('todo');
  const [context, setContext] = useState<TodoContext>('none');
  const [dueDate, setDueDate] = useState('');
  const [reminders, setReminders] = useState<ReminderInput[]>([]);
  const [titleError, setTitleError] = useState('');

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['todo', id],
    queryFn: () => getTodo(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setStatus(existing.status);
      setContext(existing.context);
      setDueDate(existing.dueDate ? existing.dueDate.slice(0, 10) : '');
      setReminders(
        existing.reminders.map((r) => ({
          offsetValue: r.offsetValue,
          offsetUnit: r.offsetUnit,
        })),
      );
    }
  }, [existing]);

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: (data) => {
      toast.success('할일이 생성되었습니다.');
      qc.invalidateQueries({ queryKey: ['todos'] });
      window.location.href = `/todo/${data.id}`;
    },
    onError: () => {
      toast.error('할일 생성에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ todoId, data }: { todoId: string; data: Parameters<typeof updateTodo>[1] }) =>
      updateTodo(todoId, data),
    onSuccess: () => {
      toast.success('할일이 수정되었습니다.');
      qc.invalidateQueries({ queryKey: ['todo', id] });
      qc.invalidateQueries({ queryKey: ['todos'] });
      window.location.href = `/todo/${id}`;
    },
    onError: () => {
      toast.error('할일 수정에 실패했습니다.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError('제목을 입력해 주세요.');
      return;
    }
    setTitleError('');

    const payload = {
      title: title.trim(),
      status,
      context,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      reminders: reminders.length > 0 ? reminders : undefined,
    };

    if (isEdit && id) {
      updateMutation.mutate({ todoId: id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const addReminder = () => {
    setReminders([...reminders, { offsetValue: 1, offsetUnit: 'hour' }]);
  };

  const removeReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const updateReminder = (index: number, field: keyof ReminderInput, value: string | number) => {
    const updated = [...reminders];
    updated[index] = { ...updated[index], [field]: value };
    setReminders(updated);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && loadingExisting) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">{isEdit ? '할일 수정' : '새 할일'}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="할일 제목을 입력하세요"
              />
              {titleError && <p className="text-sm text-destructive">{titleError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>상태</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TodoStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">대기</SelectItem>
                    <SelectItem value="in_progress">진행중</SelectItem>
                    <SelectItem value="done">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>컨텍스트</Label>
                <Select value={context} onValueChange={(v) => setContext(v as TodoContext)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">없음</SelectItem>
                    <SelectItem value="work">업무</SelectItem>
                    <SelectItem value="home">가정</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">마감일</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">알림 설정</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addReminder}>
                <Plus className="h-4 w-4 mr-1" />
                알림 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">알림이 없습니다.</p>
            ) : (
              reminders.map((reminder, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={reminder.offsetValue}
                    onChange={(e) => updateReminder(index, 'offsetValue', Number(e.target.value))}
                    className="w-24"
                  />
                  <Select
                    value={reminder.offsetUnit}
                    onValueChange={(v) =>
                      updateReminder(index, 'offsetUnit', v as ReminderOffsetUnit)
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minute">분 전</SelectItem>
                      <SelectItem value="hour">시간 전</SelectItem>
                      <SelectItem value="day">일 전</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeReminder(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? '처리중...' : isEdit ? '수정' : '생성'}
          </Button>
          <Button type="button" variant="outline" onClick={() => history.back()}>
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function TodoForm({ id }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoFormContent id={id} />
    </QueryClientProvider>
  );
}
