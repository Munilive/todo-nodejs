import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateTodoDto } from '../../todo/dto/create-todo.dto';
import { ListTodoQueryDto } from '../../todo/dto/list-todo.query.dto';
import { CreateTodoResponseDto } from '../../todo/dto/todo-response.dto';
import { UpdateTodoDto } from '../../todo/dto/update-todo.dto';
import {
  AdminTodoDetailResponseDto,
  AdminTodoListResponseDto,
} from './dto/admin-todo-response.dto';
import { AdminTodoService } from './admin-todo.service';

@ApiTags('admin / todo')
@Controller('admin/v1/todo')
export class AdminTodoController {
  constructor(private readonly adminTodoService: AdminTodoService) {}

  @Get()
  @ApiOkResponse({ description: '할일 목록 (미리 알림 건수 포함)', type: AdminTodoListResponseDto })
  list(@Query() query: ListTodoQueryDto) {
    return this.adminTodoService.list(query);
  }

  @Get(':todoId')
  @ApiOkResponse({
    description: '할일 상세 (미리 알림 전체 포함)',
    type: AdminTodoDetailResponseDto,
  })
  get(@Param('todoId', ParseUUIDPipe) todoId: string) {
    return this.adminTodoService.get(todoId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: '할일 생성', type: CreateTodoResponseDto })
  create(@Body() dto: CreateTodoDto) {
    return this.adminTodoService.create(dto);
  }

  @Put(':todoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: '할일 수정' })
  async update(@Param('todoId', ParseUUIDPipe) todoId: string, @Body() dto: UpdateTodoDto) {
    await this.adminTodoService.update(todoId, dto);
  }

  @Delete(':todoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: '할일 삭제 (연관 미리 알림 전체 삭제)' })
  async remove(@Param('todoId', ParseUUIDPipe) todoId: string) {
    await this.adminTodoService.remove(todoId);
  }
}
