# back_end/Dockerfile
FROM python:3.13-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgl1-mesa-dev \
    libglib2.0-0 \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 환경 변수 설정
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# 포트 노출
EXPOSE 5010

# Gunicorn으로 실행 (애플리케이션 팩토리 사용)
CMD ["gunicorn", "--bind", "0.0.0.0:5010", "--workers", "4", "app:create_app()"]