import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { getTodos } from '@/lib/api';
import type { TodoListItem, TodoStatus, TodoContext } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

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

function TodoTableContent() {
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [titleFilter, setTitleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<TodoStatus | 'all'>('all');
  const [contextFilter, setContextFilter] = useState<TodoContext | 'all'>('all');
  const [titleInput, setTitleInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [
      'todos',
      { skip, limit, title: titleFilter, status: statusFilter, context: contextFilter },
    ],
    queryFn: () =>
      getTodos({
        skip,
        limit,
        title: titleFilter || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        context: contextFilter === 'all' ? undefined : contextFilter,
      }),
  });

  const columns: ColumnDef<TodoListItem>[] = [
    {
      accessorKey: 'title',
      header: '제목',
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => (
        <Badge variant={`status-${row.original.status}` as VariantProps<typeof badgeVariants>['variant']}>
          {STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: 'context',
      header: '컨텍스트',
      cell: ({ row }) => (
        <Badge variant={`context-${row.original.context}` as VariantProps<typeof badgeVariants>['variant']}>
          {CONTEXT_LABELS[row.original.context]}
        </Badge>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: '마감일',
      cell: ({ row }) =>
        row.original.dueDate
          ? format(new Date(row.original.dueDate), 'yyyy-MM-dd', { locale: ko })
          : '-',
    },
    {
      id: 'reminders',
      header: '알림',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.pendingReminderCount > 0 ? (
            <span className="text-yellow-600">
              {row.original.reminderCount}개 ({row.original.pendingReminderCount}개 대기)
            </span>
          ) : (
            <span className="text-muted-foreground">{row.original.reminderCount}개</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '생성일',
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko }),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.location.href = `/todo/${row.original.id}`;
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          상세
        </Button>
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

  const handleSearch = () => {
    setTitleFilter(titleInput);
    setSkip(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">할일 목록</h2>
        <Button onClick={() => (window.location.href = '/todo/new')}>
          <Plus className="h-4 w-4 mr-2" />새 할일
        </Button>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3 flex-wrap">
            <div className="flex gap-2 flex-1 min-w-[200px]">
              <Input
                placeholder="제목 검색..."
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="max-w-xs"
              />
              <Button variant="outline" onClick={handleSearch}>
                검색
              </Button>
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as TodoStatus | 'all');
                setSkip(0);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="상태 전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">상태 전체</SelectItem>
                <SelectItem value="todo">대기</SelectItem>
                <SelectItem value="in_progress">진행중</SelectItem>
                <SelectItem value="done">완료</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={contextFilter}
              onValueChange={(v) => {
                setContextFilter(v as TodoContext | 'all');
                setSkip(0);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="컨텍스트 전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">컨텍스트 전체</SelectItem>
                <SelectItem value="none">없음</SelectItem>
                <SelectItem value="work">업무</SelectItem>
                <SelectItem value="home">가정</SelectItem>
              </SelectContent>
            </Select>
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
                        할일이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => (window.location.href = `/todo/${row.original.id}`)}
                      >
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
    </div>
  );
}

export default function TodoTable() {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoTableContent />
    </QueryClientProvider>
  );
}
