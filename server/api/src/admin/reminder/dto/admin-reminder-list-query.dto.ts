import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

enum ReminderStatus {
  PENDING = 'pending',
  SENT = 'sent',
}

export class AdminReminderListQueryDto {
  @ApiPropertyOptional({ description: '건너뛸 수', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @ApiPropertyOptional({ description: '한 번에 조회할 수량', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: '할일 ID 필터' })
  @IsOptional()
  @IsUUID()
  todoId?: string;

  @ApiPropertyOptional({
    enum: ReminderStatus,
    description: '발송 상태 필터 (pending: 미발송, sent: 발송완료)',
  })
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @ApiPropertyOptional({ description: '알림 예정일 시작 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startRemindAt?: string;

  @ApiPropertyOptional({ description: '알림 예정일 종료 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endRemindAt?: string;
}
