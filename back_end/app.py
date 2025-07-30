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

def create_app(config_name='default'):
    """Flask 애플리케이션 팩토리 함수"""
    app = Flask(__name__)
    
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

if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        db.create_all()
    
    app.run(
        debug=app.config.get('DEBUG', True),
        host=os.getenv('HOST', '0.0.0.0'),
        port=int(os.getenv('PORT', 5000))
    )