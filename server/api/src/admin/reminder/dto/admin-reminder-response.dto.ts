import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReminderOffsetUnit } from '@app/domain';

export class AdminReminderListItemDto {
  @ApiProperty({ description: '미리 알림 ID' })
  id!: string;

  @ApiProperty({ description: '할일 ID' })
  todoId!: string;

  @ApiProperty({ description: '할일 제목' })
  todoTitle!: string;

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

export class AdminReminderListResponseDto {
  @ApiProperty({ type: [AdminReminderListItemDto] })
  items!: AdminReminderListItemDto[];

  @ApiProperty({ description: '전체 건수' })
  totalCount!: number;

  @ApiProperty({ description: '건너뛴 수', default: 0 })
  skip!: number;

  @ApiProperty({ description: '한 번에 조회한 수', default: 20 })
  limit!: number;
}
