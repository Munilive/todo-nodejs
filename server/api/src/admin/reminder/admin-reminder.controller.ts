import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminReminderListResponseDto } from './dto/admin-reminder-response.dto';
import { AdminReminderListQueryDto } from './dto/admin-reminder-list-query.dto';
import { AdminReminderService } from './admin-reminder.service';

@ApiTags('admin / reminder')
@Controller('admin/v1')
export class AdminReminderController {
  constructor(private readonly adminReminderService: AdminReminderService) {}

  @Get('reminders')
  @ApiOkResponse({ description: '전체 미리 알림 목록', type: AdminReminderListResponseDto })
  list(@Query() query: AdminReminderListQueryDto) {
    return this.adminReminderService.list(query);
  }

  @Get('todo/:todoId/reminders')
  @ApiOkResponse({ description: '특정 할일의 미리 알림 목록 (발송 완료 포함)' })
  listByTodo(@Param('todoId', ParseUUIDPipe) todoId: string) {
    return this.adminReminderService.listByTodo(todoId);
  }

  @Delete('todo/:todoId/reminders/:reminderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: '미리 알림 삭제' })
  async remove(
    @Param('todoId', ParseUUIDPipe) todoId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
  ) {
    await this.adminReminderService.remove(todoId, reminderId);
  }

  @Post('todo/:todoId/reminders/:reminderId/notify')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: '미리 알림 강제 발송 (Slack)' })
  async notify(
    @Param('todoId', ParseUUIDPipe) todoId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
  ) {
    await this.adminReminderService.notify(todoId, reminderId);
  }
}
