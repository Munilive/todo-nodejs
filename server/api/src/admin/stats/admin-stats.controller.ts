import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminStatsResponseDto } from './dto/admin-stats-response.dto';
import { AdminStatsService } from './admin-stats.service';

@ApiTags('admin / stats')
@Controller('admin/v1/stats')
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get()
  @ApiOkResponse({ description: '통계 개요', type: AdminStatsResponseDto })
  getOverview() {
    return this.adminStatsService.getOverview();
  }
}
