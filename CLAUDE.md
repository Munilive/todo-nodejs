# todo-nodejs

Node.js 학습용으로 만든 Todo 앱을 dev-standards 기준으로 마이그레이션한 프로젝트.

## 스택

| 구분 | 기술 |
|------|------|
| 런타임 | Node.js 24 |
| 프레임워크 | NestJS |
| ORM | MikroORM v6 |
| DB | PostgreSQL |
| 로깅 | nestjs-pino |
| 유효성 검사 | class-validator |
| API 문서 | @nestjs/swagger |
| 테스트 | Vitest |

## 워크스페이스 구조

```
todo-nodejs/
├── server/
│   └── api/            ← @todo-nodejs/api (NestJS)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── config/
│       │   ├── common/
│       │   └── todo/
│       ├── migrations/
│       └── test/
├── packages/
│   └── domain/         ← @todo-nodejs/domain (Phase 3/4에서 비즈니스 로직 분리 예정)
└── pnpm-workspace.yaml
```

## 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경변수 설정

```bash
cp server/envs/.env.dev server/api/.env
# .env에서 DB_PASSWORD 등 비밀값 입력
```

### 3. PostgreSQL 실행 (Docker)

```bash
docker run -d \
  --name todo-postgres \
  -e POSTGRES_DB=todo \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16
```

### 4. DB 마이그레이션

```bash
pnpm --filter @todo-nodejs/api migration:up
```

### 5. 서버 실행

```bash
pnpm dev          # 루트에서 실행
# 또는
pnpm --filter @todo-nodejs/api dev
```

서버 기동 후:
- API: `http://localhost:8080/api`
- Swagger: `http://localhost:8080/api/docs`
- 헬스체크: `http://localhost:8080/health`

## 환경변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | `8080` | 서버 포트 |
| `NODE_ENV` | `development` | 환경 |
| `DB_HOST` | `localhost` | PostgreSQL 호스트 |
| `DB_PORT` | `5432` | PostgreSQL 포트 |
| `DB_NAME` | `todo` | DB 이름 |
| `DB_USER` | `postgres` | DB 유저 |
| `DB_PASSWORD` | — | DB 패스워드 (필수) |
| `HEALTH_CHECK_URL` | `/health` | 헬스체크 경로 |

## 마이그레이션

```bash
# 새 마이그레이션 파일 생성
pnpm --filter @todo-nodejs/api migration:create

# 마이그레이션 적용
pnpm --filter @todo-nodejs/api migration:up

# 마이그레이션 롤백
pnpm --filter @todo-nodejs/api migration:down
```

## 테스트

```bash
pnpm test                   # 전체 테스트 실행
pnpm test:coverage          # 커버리지 포함 실행
pnpm --filter @todo-nodejs/api test:watch  # watch 모드
```

## 주요 스크립트 (루트)

| 스크립트 | 설명 |
|----------|------|
| `pnpm dev` | API 서버 개발 모드 실행 |
| `pnpm test` | 전체 워크스페이스 테스트 |
| `pnpm test:coverage` | 커버리지 리포트 |
| `pnpm lint` | ESLint 검사 |
| `pnpm format` | Prettier 포맷팅 |
