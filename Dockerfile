# 1. Build 단계
FROM node:22 AS build
# pnpm 설치
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
WORKDIR /app
# 의존성 설치
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
# 소스 복사 및 빌드
COPY . ./
RUN pnpm build
# 2. Production 단계
FROM nginx:alpine
# 빌드된 파일을 Nginx로 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80   
CMD ["nginx", "-g", "daemon off;"]
