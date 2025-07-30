#!/usr/bin/env python3
"""
MariaDB 테이블 생성 스크립트
"""

import os
from dotenv import load_dotenv

# 가장 먼저 환경 변수 로드
load_dotenv()

# 환경 변수 확인
print("🔍 환경 변수 확인:")
env_vars = {
    'MYSQL_HOST': os.environ.get('MYSQL_HOST'),
    'MYSQL_PORT': os.environ.get('MYSQL_PORT'),
    'MYSQL_USER': os.environ.get('MYSQL_USER'),
    'MYSQL_PASSWORD': os.environ.get('MYSQL_PASSWORD'),
    'MYSQL_DATABASE': os.environ.get('MYSQL_DATABASE')
}

for key, value in env_vars.items():
    status = "✅" if value else "❌"
    print(f"{status} {key}: {value}")

# 모든 환경 변수가 있는지 확인
if all(env_vars.values()):
    print("\n✅ 모든 환경 변수가 설정되었습니다!")
else:
    print("\n❌ 일부 환경 변수가 설정되지 않았습니다.")
    print("💡 .env 파일을 확인하세요.")

# 그 다음에 다른 모듈 임포트
from app import create_app
from models import db, User, Object, MonitoringLog

def create_database_tables():
    """MariaDB에 테이블을 생성합니다."""
    
    # Flask 앱 생성
    app = create_app()
    
    with app.app_context():
        try:
            print("\n🔍 MariaDB 연결 확인 중...")
            
            # 데이터베이스 연결 테스트
            db.engine.execute("SELECT 1")
            print("✅ MariaDB 연결 성공!")
            
            # 테이블 생성
            print("📋 테이블 생성 중...")
            db.create_all()
            
            # 생성된 테이블 확인
            result = db.engine.execute("SHOW TABLES")
            tables = [row[0] for row in result]
            print(f"✅ 생성된 테이블: {tables}")
            
            # 테이블 구조 확인
            for table_name in tables:
                print(f"\n📊 {table_name} 테이블 구조:")
                result = db.engine.execute(f"DESCRIBE {table_name}")
                for row in result:
                    print(f"  - {row[0]}: {row[1]} ({row[2]})")
            
            print("\n🎉 모든 테이블이 성공적으로 생성되었습니다!")
            
        except Exception as e:
            print(f"❌ 오류 발생: {str(e)}")
            print("\n🔧 문제 해결 방법:")
            print("1. MariaDB 서비스가 실행 중인지 확인")
            print("2. .env 파일의 데이터베이스 설정 확인")
            print("3. 데이터베이스가 생성되었는지 확인")
            print("4. 사용자 권한 확인")

if __name__ == "__main__":
    create_database_tables() 