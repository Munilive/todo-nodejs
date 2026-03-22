# todo-nodejs

Node.js 학습용 Todo 앱 → **dev-standards** 기반 마이그레이션 프로젝트

Express.js + Mongoose + CommonJS로 작성된 학습용 코드를
NestJS + MikroORM + TypeScript + pnpm workspace 구조로 마이그레이션한 결과물입니다.

## 기술 스택

| | |
|--|--|
| Runtime | Node.js 24 |
| Framework | NestJS |
| ORM | MikroORM v6 |
| DB | PostgreSQL |
| Language | TypeScript (strict) |
| Package manager | pnpm workspace |
| Logging | nestjs-pino |
| Validation | class-validator |
| API docs | Swagger (`/api/docs`) |
| Test | Vitest |
| CI | GitHub Actions |

## 빠른 시작

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경변수 설정
cp server/api/.env.example server/api/.env
# DB_PASSWORD 등 비밀값 입력

# 3. DB 실행 (Docker)
docker run -d --name todo-postgres \
  -e POSTGRES_DB=todo -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16

# 4. 마이그레이션
pnpm --filter @todo-nodejs/api migration:up

# 5. 서버 실행
pnpm dev
```

- API: `http://localhost:8080/api`
- Swagger: `http://localhost:8080/api/docs`

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/todo` | 할일 목록 (페이지네이션, 검색) |
| GET | `/api/todo/:id` | 할일 상세 |
| POST | `/api/todo` | 할일 생성 |
| PUT | `/api/todo/:id` | 할일 수정 |
| DELETE | `/api/todo/:id` | 할일 삭제 |
| GET | `/health` | 헬스체크 |

## 테스트

```bash
pnpm test            # 단위 + E2E 테스트 (32건)
pnpm test:coverage   # 커버리지 포함
```

## 마이그레이션 이력

| Phase | 내용 |
|-------|------|
| 1 | pnpm 전환, ESLint v10, Prettier, Husky |
| 2 | pnpm workspace 모노레포 구조 |
| 3+4 | TypeScript + NestJS 전환 (Express 제거) |
| 5 | MikroORM + PostgreSQL 전환 (Mongoose 제거) |
| 6 | Vitest 테스트 + GitHub Actions CI |
| 7 | CLAUDE.md, env 구조, renovate |
