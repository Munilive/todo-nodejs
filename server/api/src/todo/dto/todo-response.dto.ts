import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReminderOffsetUnit, TodoContext, TodoStatus } from '@app/domain';

export class ReminderResponseDto {
  @ApiProperty({ description: '미리 알림 ID' })
  id!: string;

  @ApiProperty({ description: '미리 알림 값', example: 1 })
  offsetValue!: number;

  @ApiProperty({ enum: ReminderOffsetUnit, description: '미리 알림 단위' })
  offsetUnit!: ReminderOffsetUnit;

  @ApiProperty({ description: '알림 발송 예정 일시' })
  remindAt!: Date;

  @ApiPropertyOptional({ description: '알림 발송 완료 일시', nullable: true })
  notifiedAt!: Date | null;

  @ApiProperty({ description: '생성일시' })
  createdAt!: Date;
}

export class TodoResponseDto {
  @ApiProperty({ description: '할일 ID' })
  id!: string;

  @ApiProperty({ description: '할일 제목' })
  title!: string;

  @ApiProperty({ enum: TodoStatus, description: '진행 상태' })
  status!: TodoStatus;

  @ApiProperty({ enum: TodoContext, description: '컨텍스트' })
  context!: TodoContext;

  @ApiPropertyOptional({ description: '예상 마감일', nullable: true })
  dueDate!: Date | null;

  @ApiProperty({ description: '생성일시' })
  createdAt!: Date;

  @ApiPropertyOptional({ description: '완료일시', nullable: true })
  doneAt!: Date | null;
}

export class TodoListResponseDto {
  @ApiProperty({ type: [TodoResponseDto] })
  items!: TodoResponseDto[];

  @ApiProperty({ description: '전체 건수' })
  totalCount!: number;

  @ApiProperty({ description: '건너뛴 수', default: 0 })
  skip!: number;

  @ApiProperty({ description: '한 번에 조회한 수', default: 10 })
  limit!: number;

  @ApiProperty({ description: '정렬 기준', default: '-createdAt' })
  sort!: string;
}

export class CreateTodoResponseDto {
  @ApiProperty({ description: '생성된 할일 ID' })
  id!: string;
}
