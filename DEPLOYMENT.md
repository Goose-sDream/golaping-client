# Golaping 배포 아키텍처

이 문서는 Golaping 프론트엔드의 EC2 + Docker + Nginx 배포 구조를 설명합니다.

## 구성요소 관계도

```
┌─────────────────────────────────────────────────────────┐
│                      EC2 (호스트 서버)                    │
│                                                         │
│  /etc/nginx/        ← Nginx 설정 파일 보관               │
│  /etc/letsencrypt/  ← SSL 인증서 보관                    │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Docker Container                      │  │
│  │                                                    │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │              Nginx (웹서버)                    │ │  │
│  │  │                                              │ │  │
│  │  │   /usr/share/nginx/html/                     │ │  │
│  │  │   ├── index.html                             │ │  │
│  │  │   ├── main.js        ← React 빌드 결과물      │ │  │
│  │  │   └── ...                                    │ │  │
│  │  │                                              │ │  │
│  │  │   /etc/nginx/ ◀── EC2에서 마운트됨            │ │  │
│  │  │   /etc/letsencrypt/ ◀── EC2에서 마운트됨      │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 각 구성요소의 역할

| 구성요소 | 역할 |
|---------|------|
| **EC2** | AWS 클라우드 서버. Docker를 실행하고, Nginx 설정 파일과 SSL 인증서를 보관 |
| **Docker** | Nginx + React 빌드 결과물을 하나의 이미지로 패키징. 어디서든 동일하게 실행 가능 |
| **Nginx** | 컨테이너 내부의 웹서버. 사용자 요청에 React 정적 파일(HTML/JS/CSS)을 응답 |

## 왜 Docker 안에 Nginx를 넣었나?

React 앱은 빌드하면 HTML/JS/CSS 파일이 됩니다. 이 파일들을 사용자에게 전달하려면 웹서버가 필요합니다.

```
사용자: "index.html 주세요"
    │
    ▼
  Nginx: "네, 여기요" → index.html 전송
```

Docker 이미지에 Nginx와 빌드 결과물을 함께 넣으면:
- `docker run` 한 번으로 바로 실행
- EC2에 Node.js나 Nginx를 따로 설치할 필요 없음
- 다른 서버로 옮겨도 동일하게 동작

## 왜 Nginx 설정은 EC2에 두었나?

설정파일을 Docker 이미지 안에 넣으면 설정 한 줄 바꿀 때마다 이미지를 다시 빌드해야 합니다.

EC2 호스트에 두고 마운트하면:
- 설정 변경 시 → `docker restart`만 하면 됨
- SSL 인증서 갱신 시 → certbot이 자동 갱신, 컨테이너 재시작만

## 요청 흐름

```
사용자 브라우저
     │
     ▼ HTTPS 요청 (443 포트)
   EC2 서버
     │
     ▼ 포트 매핑 (-p 443:443)
 Docker Container
     │
     ▼
   Nginx (설정은 EC2에서 마운트)
     │
     ▼ 정적 파일 응답
 /usr/share/nginx/html/
```

## 배포 플로우

### 전체 흐름

```
┌──────────┐    push     ┌──────────┐
│  개발자   │ ─────────▶ │  GitHub  │
└──────────┘             └────┬─────┘
                              │
                              ▼ Actions 트리거
                    ┌─────────────────────┐
                    │   GitHub Actions    │
                    │                     │
                    │  1. docker build    │
                    │     (내부에서 pnpm  │
                    │      build 실행)    │
                    │  2. docker push     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                │                ▼
        ┌──────────┐           │          ┌──────────┐
        │ DockerHub│           │          │   EC2    │
        │  (이미지) │◀──────────┘          │  서버    │
        └────┬─────┘                      └────┬─────┘
             │                                 │
             │      3. SSH로 EC2 접속          │
             │      4. docker pull             │
             └────────────────▶────────────────┘
                                               │
                                               ▼
                                     5. docker run
                                               │
                                               ▼
                                    ┌─────────────────┐
                                    │ Docker Container│
                                    │    (Nginx)      │
                                    └─────────────────┘
```

### 1단계: Docker 이미지 빌드 (Multi-stage)

```dockerfile
# Dockerfile

# Stage 1: 빌드 환경
FROM node:22 AS build
RUN pnpm install
RUN pnpm build          # → /app/dist 생성

# Stage 2: 실행 환경 (빌드 도구 제외, 경량화)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

### 2단계: EC2 배포

GitHub Actions가 SSH로 EC2에 접속하여 실행:

```bash
# 기존 컨테이너 정리
docker stop golaping-app
docker rm golaping-app

# 새 이미지 가져오기
docker pull $DOCKERHUB_IMAGE

# 새 컨테이너 실행
docker run -d --name golaping-app \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -v /etc/nginx:/etc/nginx:ro \
  $DOCKERHUB_IMAGE
```

## 볼륨 마운트 설명

| 호스트 경로 | 컨테이너 경로 | 용도 |
|------------|--------------|------|
| `/etc/letsencrypt/` | `/etc/letsencrypt/` | Let's Encrypt SSL 인증서 |
| `/etc/nginx/` | `/etc/nginx/` | Nginx 설정 파일 |

`:ro`는 read-only. 컨테이너에서 수정 불가 (보안).

## EC2에서 직접 관리하는 파일

이 레포에는 없지만, EC2 서버에 있어야 하는 파일들:

```
/etc/nginx/
├── nginx.conf
└── conf.d/
    └── default.conf

/etc/letsencrypt/
└── live/your-domain/
    ├── fullchain.pem
    └── privkey.pem
```

## 참고: deploy.yml의 중복 빌드

현재 `.github/workflows/deploy.yml`에서 `pnpm build`가 GitHub Actions와 Dockerfile 양쪽에서 실행됩니다. 이는 중복이며, Dockerfile 내부 빌드만으로 충분합니다.
