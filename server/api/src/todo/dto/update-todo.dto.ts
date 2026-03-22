import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TodoContext, TodoStatus } from '@app/domain';
import { ReminderDto } from './reminder.dto';

export class UpdateTodoDto {
  @ApiPropertyOptional({ description: '할일 제목' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ enum: TodoStatus })
  @IsOptional()
  @IsEnum(TodoStatus, { message: '`status`는 `todo, in_progress, done` 만 지정 할 수 있습니다.' })
  status?: TodoStatus;

  @ApiPropertyOptional({ enum: TodoContext })
  @IsOptional()
  @IsEnum(TodoContext, { message: '`context`는 `none, work, home` 만 지정 할 수 있습니다.' })
  context?: TodoContext;

  @ApiPropertyOptional({ description: '예상 마감일 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: '입력 하신 (`dueDate`) 데이터 타입이 잘못 되었습니다.' })
  dueDate?: string;

  @ApiPropertyOptional({
    type: [ReminderDto],
    description: '미리 알림 목록 (기존 미발송 알림 전체 교체)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReminderDto)
  reminders?: ReminderDto[];
}
