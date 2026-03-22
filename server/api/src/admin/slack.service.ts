import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AdminSlackService {
  private readonly logger = new Logger(AdminSlackService.name);
  private readonly webhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.webhookUrl = this.configService.get<string>('slack.webhookUrl') ?? '';
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.webhookUrl) {
      throw new Error('SLACK_WEBHOOK_URL이 설정되지 않았습니다.');
    }
    await firstValueFrom(this.httpService.post(this.webhookUrl, { text }));
  }
}
