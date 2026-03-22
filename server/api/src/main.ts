import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.setGlobalPrefix('api', { exclude: ['/health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const isSwaggerEnabled = process.env['ENABLE_SWAGGER'] === 'true';

  if (isSwaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Todo API')
      .setDescription('Todo 관리 API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env['PORT'] ?? '8080';
  await app.listen(port);

  const baseUrl = `http://localhost:${port}`;
  logger.log(`Server running on ${baseUrl}/api`);
  if (isSwaggerEnabled) {
    logger.log(`Swagger running on ${baseUrl}/api/docs`);
  }
}

bootstrap().catch((err: unknown) => {
  console.error('서버 시작 중 오류가 발생했습니다.', err);
  process.exit(1);
});
