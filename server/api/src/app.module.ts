import { type MikroOrmModuleOptions, MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { configuration } from './config/configuration';
import { HealthModule } from './health/health.module';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'api/.env',
      load: [configuration],
    }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      // TODO: @mikro-orm/postgresql v7 타입 버그 (SqlSchemaGenerator가 ISchemaGenerator 미완성 구현)
      // https://github.com/mikro-orm/mikro-orm/issues 에서 수정되면 캐스트 제거
      useFactory: (config: ConfigService) =>
        ({
          driver: PostgreSqlDriver,
          host: config.get<string>('db.host'),
          port: config.get<number>('db.port'),
          dbName: config.get<string>('db.name'),
          user: config.get<string>('db.user'),
          password: config.get<string>('db.password'),
          autoLoadEntities: true,
        }) as unknown as MikroOrmModuleOptions,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    HealthModule,
    TodoModule,
  ],
})
export class AppModule {}
