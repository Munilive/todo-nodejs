import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TodoContext, TodoStatus } from '../entities/todo.entity';

export class ListTodoQueryDto {
  @ApiPropertyOptional({ description: '건너뛸 수', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '조회를 건너뛸 수(`skip`)의 데이터 타입은 `Number`입니다.' })
  @Min(0)
  skip?: number = 0;

  @ApiPropertyOptional({ description: '한 번에 조회할 수량', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '한번에 조회할 수량(`limit`)의 데이터 타입은 `Number`입니다.' })
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '정렬 기준', default: '-createdAt' })
  @IsOptional()
  @IsString()
  sort?: string = '-createdAt';

  @ApiPropertyOptional({ description: '제목 검색' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: TodoStatus })
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;

  @ApiPropertyOptional({ enum: TodoContext })
  @IsOptional()
  @IsEnum(TodoContext)
  context?: TodoContext;

  @ApiPropertyOptional({ description: '예상 마감일 시작 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDueDate?: string;

  @ApiPropertyOptional({ description: '예상 마감일 종료 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDueDate?: string;

  @ApiPropertyOptional({ description: '완료일 시작 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDoneAt?: string;

  @ApiPropertyOptional({ description: '완료일 종료 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDoneAt?: string;

  @ApiPropertyOptional({ description: '생성일 시작 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startCreatedAt?: string;

  @ApiPropertyOptional({ description: '생성일 종료 (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endCreatedAt?: string;
}
