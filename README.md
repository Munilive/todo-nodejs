# todo-nodejs

Node.js 학습용 Todo 앱 → **dev-standards** 기반 마이그레이션 프로젝트

Express.js + Mongoose + CommonJS로 작성된 학습용 코드를
NestJS + MikroORM + TypeScript + pnpm workspace 구조로 마이그레이션한 결과물입니다.

## 기술 스택

|                 |                                         |
| --------------- | --------------------------------------- |
| Runtime         | Node.js 24                              |
| Framework       | NestJS v11                              |
| ORM             | MikroORM v7                             |
| DB              | PostgreSQL                              |
| Language        | TypeScript (strict)                     |
| Package manager | pnpm workspace                          |
| Logging         | nestjs-pino                             |
| Validation      | class-validator                         |
| API docs        | Swagger (`/api/docs`)                   |
| Test            | Vitest                                  |
| Admin UI        | Astro v5 + React + Tailwind + shadcn/ui |

## 워크스페이스 구조

```
todo-nodejs/
├── server/               ← NestJS CLI 모노레포 (단일 pnpm 패키지)
│   ├── api/              ← REST API 서버
│   ├── batch/            ← 리마인더 스케줄러
│   ├── libs/domain/      ← 공유 도메인 (@app/domain)
│   └── envs/             ← 환경변수 템플릿
└── admin/                ← 어드민 UI (Astro)
```

## 빠른 시작

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경변수 설정
cp server/envs/.env.dev server/api/.env
# server/api/.env 에서 DB_PASSWORD 등 비밀값 입력

# 3. DB 실행 (Docker)
docker run -d --name todo-postgres \
  -e POSTGRES_DB=todo -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16

# 4. 마이그레이션
pnpm --filter @todo-nodejs/server migration:up

# 5. 서버 + 어드민 실행
pnpm dev
```

| 서비스    | URL                              |
| --------- | -------------------------------- |
| API       | `http://localhost:8080/api`      |
| Swagger   | `http://localhost:8080/api/docs` |
| 헬스체크  | `http://localhost:8080/health`   |
| 어드민 UI | `http://localhost:4321`          |

## API 엔드포인트

### Todo

| Method | Path            | 설명                                               |
| ------ | --------------- | -------------------------------------------------- |
| GET    | `/api/todo`     | 할일 목록 (페이지네이션, 검색, 상태/컨텍스트 필터) |
| GET    | `/api/todo/:id` | 할일 상세 (리마인더 포함)                          |
| POST   | `/api/todo`     | 할일 생성                                          |
| PUT    | `/api/todo/:id` | 할일 수정                                          |
| DELETE | `/api/todo/:id` | 할일 삭제                                          |
| GET    | `/health`       | 헬스체크                                           |

### Admin (`/admin/v1`)

| Method | Path                                              | 설명                         |
| ------ | ------------------------------------------------- | ---------------------------- |
| GET    | `/admin/v1/todo`                                  | 할일 목록 (리마인더 수 포함) |
| GET    | `/admin/v1/todo/:id`                              | 할일 상세                    |
| POST   | `/admin/v1/todo`                                  | 할일 생성                    |
| PUT    | `/admin/v1/todo/:id`                              | 할일 수정                    |
| DELETE | `/admin/v1/todo/:id`                              | 할일 삭제                    |
| GET    | `/admin/v1/reminders`                             | 전체 리마인더 목록 (필터)    |
| GET    | `/admin/v1/todo/:id/reminders`                    | 특정 할일의 리마인더 목록    |
| DELETE | `/admin/v1/todo/:id/reminders/:reminderId`        | 리마인더 삭제                |
| POST   | `/admin/v1/todo/:id/reminders/:reminderId/notify` | 리마인더 강제 발송           |
| GET    | `/admin/v1/stats`                                 | 대시보드 통계                |

## 테스트

```bash
pnpm test            # 전체 테스트
pnpm test:coverage   # 커버리지 포함
```

## 주요 스크립트

| 스크립트                                             | 설명                           |
| ---------------------------------------------------- | ------------------------------ |
| `pnpm dev`                                           | API 서버 + 어드민 UI 동시 실행 |
| `pnpm dev:admin`                                     | 어드민 UI만 실행               |
| `pnpm test`                                          | 전체 테스트                    |
| `pnpm lint`                                          | ESLint 검사                    |
| `pnpm format`                                        | Prettier 포맷팅                |
| `pnpm --filter @todo-nodejs/server migration:up`     | DB 마이그레이션 적용           |
| `pnpm --filter @todo-nodejs/server migration:create` | 마이그레이션 파일 생성         |

## 마이그레이션 이력

| Phase | 내용                                             |
| ----- | ------------------------------------------------ |
| 1     | pnpm 전환, ESLint v10, Prettier, Husky           |
| 2     | pnpm workspace 모노레포 구조                     |
| 3+4   | TypeScript + NestJS 전환 (Express 제거)          |
| 5     | MikroORM + PostgreSQL 전환 (Mongoose 제거)       |
| 6     | Vitest 테스트 + GitHub Actions CI                |
| 7     | CLAUDE.md, env 구조, renovate                    |
| 8     | Todo 리마인더 기능 + batch 스케줄러 + Slack 알림 |
| 9     | Admin REST API (`/admin/v1`) + 어드민 UI (Astro) |
