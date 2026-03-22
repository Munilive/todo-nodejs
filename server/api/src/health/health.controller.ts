import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ description: '서버 상태 확인', schema: { example: { status: 'ok' } } })
  check() {
    return { status: 'ok' };
  }
}
