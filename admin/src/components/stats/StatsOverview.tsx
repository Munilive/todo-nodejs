import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { getStats } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Bell, CheckCircle2, ListTodo } from 'lucide-react';

const queryClient = new QueryClient();

function StatsContent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">통계</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">통계</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">통계를 불러오는 데 실패했습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { todo, reminder } = data;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">통계</h2>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">전체 할일</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todo.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">기한 초과</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{todo.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">미발송 알림</CardTitle>
            <Bell className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{reminder.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">발송 완료</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{reminder.sent}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">상태별 할일</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="status-todo">대기</Badge>
                <span className="text-sm text-muted-foreground">todo</span>
              </div>
              <span className="font-semibold">{todo.byStatus.todo}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="status-in_progress">진행중</Badge>
                <span className="text-sm text-muted-foreground">in_progress</span>
              </div>
              <span className="font-semibold">{todo.byStatus.in_progress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="status-done">완료</Badge>
                <span className="text-sm text-muted-foreground">done</span>
              </div>
              <span className="font-semibold">{todo.byStatus.done}</span>
            </div>
          </CardContent>
        </Card>

        {/* Context breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">컨텍스트별 할일</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="context-none">없음</Badge>
              </div>
              <span className="font-semibold">{todo.byContext.none}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="context-work">업무</Badge>
              </div>
              <span className="font-semibold">{todo.byContext.work}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="context-home">가정</Badge>
              </div>
              <span className="font-semibold">{todo.byContext.home}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminder stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">알림 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{reminder.total}</div>
              <div className="text-sm text-muted-foreground mt-1">전체</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{reminder.pending}</div>
              <div className="text-sm text-muted-foreground mt-1">대기중</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reminder.sent}</div>
              <div className="text-sm text-muted-foreground mt-1">발송완료</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StatsOverview() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatsContent />
    </QueryClientProvider>
  );
}
