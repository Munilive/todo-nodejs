import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';
import { ReminderOffsetUnit } from '@app/domain';

export class ReminderDto {
  @ApiProperty({ description: '미리 알림 값', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  offsetValue!: number;

  @ApiProperty({ enum: ReminderOffsetUnit, description: '미리 알림 단위 (minute | hour | day)' })
  @IsEnum(ReminderOffsetUnit)
  offsetUnit!: ReminderOffsetUnit;
}
