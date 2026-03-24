import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, SendHorizonal, Trash2 } from 'lucide-react';
import { getReminders, deleteReminder, notifyReminder } from '@/lib/api';
import type { ReminderListItem, ReminderStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const queryClient = new QueryClient();

const OFFSET_UNIT_LABELS: Record<string, string> = {
  minute: '분',
  hour: '시간',
  day: '일',
};

function ReminderTableContent() {
  const qc = useQueryClient();
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | 'all'>('all');
  const [startRemindAt, setStartRemindAt] = useState('');
  const [endRemindAt, setEndRemindAt] = useState('');

  const [reminderToDelete, setReminderToDelete] = useState<ReminderListItem | null>(null);
  const [reminderToNotify, setReminderToNotify] = useState<ReminderListItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['reminders', { skip, limit, status: statusFilter, startRemindAt, endRemindAt }],
    queryFn: () =>
      getReminders({
        skip,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        startRemindAt: startRemindAt ? new Date(startRemindAt).toISOString() : undefined,
        endRemindAt: endRemindAt ? new Date(endRemindAt).toISOString() : undefined,
      }),
  });

  const deleteReminderMutation = useMutation({
    mutationFn: ({ todoId, reminderId }: { todoId: string; reminderId: string }) =>
      deleteReminder(todoId, reminderId),
    onSuccess: () => {
      toast.success('알림이 삭제되었습니다.');
      qc.invalidateQueries({ queryKey: ['reminders'] });
      setReminderToDelete(null);
    },
    onError: () => {
      toast.error('알림 삭제에 실패했습니다.');
    },
  });

  const notifyReminderMutation = useMutation({
    mutationFn: ({ todoId, reminderId }: { todoId: string; reminderId: string }) =>
      notifyReminder(todoId, reminderId),
    onSuccess: () => {
      toast.success('알림이 강제 발송되었습니다.');
      qc.invalidateQueries({ queryKey: ['reminders'] });
      setReminderToNotify(null);
    },
    onError: () => {
      toast.error('알림 강제 발송에 실패했습니다.');
    },
  });

  const isPending = (item: ReminderListItem) => item.notifiedAt === null;

  const columns: ColumnDef<ReminderListItem>[] = [
    {
      accessorKey: 'todoTitle',
      header: '할일 제목',
      cell: ({ row }) => (
        <a
          href={`/todo/${row.original.todoId}`}
          className="font-medium text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.original.todoTitle}
        </a>
      ),
    },
    {
      id: 'offsetInfo',
      header: '알림 시점',
      cell: ({ row }) =>
        `${row.original.offsetValue}${OFFSET_UNIT_LABELS[row.original.offsetUnit]} 전`,
    },
    {
      accessorKey: 'remindAt',
      header: '발송 예정일시',
      cell: ({ row }) =>
        format(new Date(row.original.remindAt), 'yyyy-MM-dd HH:mm', { locale: ko }),
    },
    {
      id: 'status',
      header: '발송 상태',
      cell: ({ row }) => (
        <Badge variant={isPending(row.original) ? 'reminder-pending' : 'reminder-sent'}>
          {isPending(row.original) ? '대기' : '발송완료'}
        </Badge>
      ),
    },
    {
      accessorKey: 'notifiedAt',
      header: '발송일시',
      cell: ({ row }) =>
        row.original.notifiedAt
          ? format(new Date(row.original.notifiedAt), 'yyyy-MM-dd HH:mm', { locale: ko })
          : '-',
    },
    {
      id: 'actions',
      header: '액션',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {isPending(row.original) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setReminderToNotify(row.original);
              }}
            >
              <SendHorizonal className="h-3.5 w-3.5 mr-1" />
              강제 발송
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setReminderToDelete(row.original);
            }}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: data?.totalCount ?? 0,
  });

  const totalCount = data?.totalCount ?? 0;
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">알림 목록</h2>

      {/* Filter bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="space-y-1">
              <Label>발송 상태</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as ReminderStatus | 'all');
                  setSkip(0);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기</SelectItem>
                  <SelectItem value="sent">발송완료</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>발송 예정 시작</Label>
              <Input
                type="date"
                value={startRemindAt}
                onChange={(e) => {
                  setStartRemindAt(e.target.value);
                  setSkip(0);
                }}
                className="w-[160px]"
              />
            </div>

            <div className="space-y-1">
              <Label>발송 예정 종료</Label>
              <Input
                type="date"
                value={endRemindAt}
                onChange={(e) => {
                  setEndRemindAt(e.target.value);
                  setSkip(0);
                }}
                className="w-[160px]"
              />
            </div>

            {(statusFilter || startRemindAt || endRemindAt) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter('all');
                  setStartRemindAt('');
                  setEndRemindAt('');
                  setSkip(0);
                }}
              >
                필터 초기화
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-3 py-3 text-left font-medium text-muted-foreground"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-3 py-8 text-center text-muted-foreground"
                      >
                        알림이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-muted/50 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-3 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {totalCount > 0
                ? `${skip + 1}-${Math.min(skip + limit, totalCount)} / ${totalCount}건`
                : '0건'}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={skip === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>
              <span className="flex items-center text-sm px-2">
                {currentPage} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSkip(skip + limit)}
                disabled={skip + limit >= totalCount}
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete reminder dialog */}
      <Dialog
        open={reminderToDelete !== null}
        onOpenChange={(open) => !open && setReminderToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림 삭제</DialogTitle>
            <DialogDescription>
              "{reminderToDelete?.todoTitle}"의 알림을 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderToDelete(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                reminderToDelete &&
                deleteReminderMutation.mutate({
                  todoId: reminderToDelete.todoId,
                  reminderId: reminderToDelete.id,
                })
              }
              disabled={deleteReminderMutation.isPending}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force notify dialog */}
      <Dialog
        open={reminderToNotify !== null}
        onOpenChange={(open) => !open && setReminderToNotify(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림 강제 발송</DialogTitle>
            <DialogDescription>
              "{reminderToNotify?.todoTitle}"의 알림을 지금 강제 발송하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderToNotify(null)}>
              취소
            </Button>
            <Button
              onClick={() =>
                reminderToNotify &&
                notifyReminderMutation.mutate({
                  todoId: reminderToNotify.todoId,
                  reminderId: reminderToNotify.id,
                })
              }
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

export default function ReminderTable() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReminderTableContent />
    </QueryClientProvider>
  );
}
