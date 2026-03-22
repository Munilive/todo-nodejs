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
import { CreateTodoDto } from './dto/create-todo.dto';
import { ListTodoQueryDto } from './dto/list-todo.query.dto';
import {
  CreateTodoResponseDto,
  TodoListResponseDto,
  TodoResponseDto,
} from './dto/todo-response.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoService } from './todo.service';

@ApiTags('todo')
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @ApiOkResponse({ description: '할일 목록', type: TodoListResponseDto })
  list(@Query() query: ListTodoQueryDto) {
    return this.todoService.list(query);
  }

  @Get(':todoId')
  @ApiOkResponse({ description: '할일 상세', type: TodoResponseDto })
  get(@Param('todoId', ParseUUIDPipe) todoId: string) {
    return this.todoService.get(todoId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: '할일 생성', type: CreateTodoResponseDto })
  create(@Body() dto: CreateTodoDto) {
    return this.todoService.create(dto);
  }

  @Put(':todoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: '할일 수정' })
  async update(@Param('todoId', ParseUUIDPipe) todoId: string, @Body() dto: UpdateTodoDto) {
    await this.todoService.update(todoId, dto);
  }

  @Delete(':todoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: '할일 삭제' })
  async remove(@Param('todoId', ParseUUIDPipe) todoId: string) {
    await this.todoService.remove(todoId);
  }
}
