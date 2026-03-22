import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly webhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.webhookUrl = this.configService.get<string>('slack.webhookUrl') ?? '';
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.warn('SLACK_WEBHOOK_URL이 설정되지 않아 알림을 건너뜁니다.');
      return;
    }

    try {
      await firstValueFrom(this.httpService.post(this.webhookUrl, { text }));
    } catch (error) {
      this.logger.error({ error }, 'Slack 알림 전송 실패');
    }
  }
}
