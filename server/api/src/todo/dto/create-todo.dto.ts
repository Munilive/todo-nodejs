import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateTodoDto {
  @ApiProperty({ description: '할일 제목' })
  @IsString()
  @IsNotEmpty({ message: '할일의 제목(`title`)이 누락됐습니다.' })
  title!: string;

  @ApiPropertyOptional({ enum: TodoStatus, default: TodoStatus.TODO })
  @IsOptional()
  @IsEnum(TodoStatus, { message: '`status`는 `todo, in_progress, done` 만 지정 할 수 있습니다.' })
  status?: TodoStatus;

  @ApiPropertyOptional({ enum: TodoContext, default: TodoContext.NONE })
  @IsOptional()
  @IsEnum(TodoContext, { message: '`context`는 `none, work, home` 만 지정 할 수 있습니다.' })
  context?: TodoContext;

  @ApiPropertyOptional({ description: '예상 마감일 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: '입력 하신 (`dueDate`) 데이터 타입이 잘못 되었습니다.' })
  dueDate?: string;

  @ApiPropertyOptional({ type: [ReminderDto], description: '미리 알림 목록 (dueDate 필수)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReminderDto)
  reminders?: ReminderDto[];
}
