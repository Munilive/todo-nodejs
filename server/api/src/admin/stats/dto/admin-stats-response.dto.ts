import { ApiProperty } from '@nestjs/swagger';

export class TodoStatsByStatusDto {
  @ApiProperty({ description: 'todo 상태 수' })
  todo!: number;

  @ApiProperty({ description: 'in_progress 상태 수' })
  in_progress!: number;

  @ApiProperty({ description: 'done 상태 수' })
  done!: number;
}

export class TodoStatsByContextDto {
  @ApiProperty({ description: 'none 컨텍스트 수' })
  none!: number;

  @ApiProperty({ description: 'work 컨텍스트 수' })
  work!: number;

  @ApiProperty({ description: 'home 컨텍스트 수' })
  home!: number;
}

export class TodoStatsDto {
  @ApiProperty({ description: '전체 할일 수' })
  total!: number;

  @ApiProperty({ type: TodoStatsByStatusDto })
  byStatus!: TodoStatsByStatusDto;

  @ApiProperty({ type: TodoStatsByContextDto })
  byContext!: TodoStatsByContextDto;

  @ApiProperty({ description: '기한 초과 (마감일 < 현재, 미완료)' })
  overdue!: number;
}

export class ReminderStatsDto {
  @ApiProperty({ description: '전체 미리 알림 수' })
  total!: number;

  @ApiProperty({ description: '미발송 수' })
  pending!: number;

  @ApiProperty({ description: '발송 완료 수' })
  sent!: number;
}

export class AdminStatsResponseDto {
  @ApiProperty({ type: TodoStatsDto })
  todo!: TodoStatsDto;

  @ApiProperty({ type: ReminderStatsDto })
  reminder!: ReminderStatsDto;
}
