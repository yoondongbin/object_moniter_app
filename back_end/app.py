import os
from dotenv import load_dotenv

# 가장 먼저 환경 변수 로드
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import datetime, timedelta
from config import config
from models import db
from routes import auth_bp, objects_bp, logs_bp, notifications_bp
from werkzeug.security import generate_password_hash
from models import User, Object
import pymysql


def create_database():
    """데이터베이스가 존재하지 않으면 생성"""
    try:
        # 환경 변수에서 데이터베이스 정보 가져오기
        host = os.getenv('MYSQL_HOST')
        port = int(os.getenv('MYSQL_PORT'))
        user = os.getenv('MYSQL_USER')
        password = os.getenv('MYSQL_PASSWORD')
        database = os.getenv('MYSQL_DATABASE')
        
        # MySQL 서버에 연결 (데이터베이스 지정하지 않음)
        connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        cursor.execute(f"SHOW DATABASES LIKE '{database}'")
        result = cursor.fetchone()
        
        if not result:
            cursor.execute(f"CREATE DATABASE {database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"✅ 데이터베이스 '{database}'가 생성되었습니다.")
            app_user = os.getenv('MYSQL_USER', 'root')
            if app_user != 'root':
                cursor.execute(f"GRANT ALL PRIVILEGES ON {database}.* TO '{app_user}'@'localhost'")
                cursor.execute("FLUSH PRIVILEGES")
                print(f"✅ 사용자 '{app_user}'에게 데이터베이스 권한이 부여되었습니다.")
        else:
            print(f"✅ 데이터베이스 '{database}'가 이미 존재합니다.")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ 데이터베이스 생성 실패: {str(e)}")
        print("SQLite를 사용합니다.")
        os.environ['DATABASE_URL'] = 'sqlite:///object_monitor.db'

def create_app(config_name='default'):
    """Flask 애플리케이션 팩토리 함수"""
    app = Flask(__name__)
    
    app.url_map.strict_slashes = False

    # JSON 인코딩 설정 (한글 지원)
    app.config['JSON_AS_ASCII'] = False
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
    
    # 설정 로드
    app.config.from_object(config[config_name])
    
    # 확장 초기화
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app)
    
    # 블루프린트 등록
    app.register_blueprint(auth_bp)
    app.register_blueprint(objects_bp)
    app.register_blueprint(logs_bp)
    app.register_blueprint(notifications_bp)
    
    # 정적 파일 서빙 설정
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        """업로드된 파일 서빙"""
        from flask import send_from_directory
        return send_from_directory('uploads', filename)
    
    # 기본 라우트
    @app.route('/')
    def home():
        return jsonify({
            'message': 'Object Monitor API',
            'version': '1.0.0',
            'status': 'running',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat()
        })
    
    # 에러 핸들러
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

def create_default_user():
    """기본 사용자 생성"""
    try:
        # 이미 사용자가 있는지 확인
        existing_user = User.query.filter_by(username='testuser').first()
        if existing_user:
            print("✅ 기본 사용자가 이미 존재합니다.")
            return existing_user
        
        # 새 사용자 생성
        password_hash = generate_password_hash('test123')
        default_user = User(
            username='testuser',
            email='test@test.com',
            password_hash=password_hash
        )
        
        db.session.add(default_user)
        db.session.commit()
        
        print("✅ 기본 사용자가 생성되었습니다.")
        
        return default_user
    
    except Exception as e:
        print(f"❌ 기본 사용자 생성 실패: {str(e)}")
        db.session.rollback()
        return None

def create_default_objects(user_id):
    """기본 객체들 생성"""
    try:
        # 기본 객체 목록
        default_objects = [
            {
                'name': '테스트 카메라',
                'description': '테스트 구역을 모니터링하는 카메라',
                'status': 'inactive'
            },
        ]
        
        created_count = 0
        
        for obj_data in default_objects:
            # 이미 존재하는지 확인
            existing_object = Object.query.filter_by(
                name=obj_data['name'], 
                user_id=user_id
            ).first()
            
            if not existing_object:
                new_object = Object(
                    name=obj_data['name'],
                    description=obj_data['description'],
                    status=obj_data['status'],
                    user_id=user_id
                )
                db.session.add(new_object)
                created_count += 1
        
        if created_count > 0:
            db.session.commit()
            print(f"기본 객체가 생성되었습니다.")
        else:
            print("기본 객체가 이미 존재합니다.")
            
    except Exception as e:
        print(f"❌ 기본 객체 생성 실패: {str(e)}")
        db.session.rollback()

if __name__ == '__main__':
    create_database()

    app = create_app()
    
    with app.app_context():
        db.create_all()

        user = create_default_user()
        if user:
            create_default_objects(user.id)
    app.run(
        debug=app.config.get('DEBUG', True),
        host=os.getenv('HOST', '0.0.0.0'),
        port=int(os.getenv('PORT', 5010))
    )