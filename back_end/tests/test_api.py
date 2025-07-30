import pytest
import json
import base64
from app import create_app
from models import db, User, Object

@pytest.fixture
def client():
    """테스트 클라이언트 생성"""
    app = create_app('testing')
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

@pytest.fixture
def auth_headers(client):
    """인증 헤더 생성"""
    # 테스트 사용자 생성
    user = User(username='testuser', password='testpass123')
    db.session.add(user)
    db.session.commit()
    
    # 로그인하여 토큰 얻기
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass123'
    })
    
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}

def test_home_endpoint(client):
    """홈 엔드포인트 테스트"""
    response = client.get('/')
    assert response.status_code == 200
    assert 'Object Monitor API' in response.json['message']

def test_login(client):
    """로그인 테스트"""
    # 테스트 사용자 생성
    user = User(username='testuser', password='testpass123')
    db.session.add(user)
    db.session.commit()
    
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass123'
    })
    
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_create_object(client, auth_headers):
    """객체 생성 테스트"""
    response = client.post('/api/objects', 
                          headers=auth_headers,
                          json={
                              'name': 'Test Camera',
                              'description': 'Test camera for monitoring'
                          })
    
    assert response.status_code == 201
    assert response.json['name'] == 'Test Camera'

def test_detection_api(client, auth_headers):
    """탐지 API 테스트"""
    # 먼저 객체 생성
    obj_response = client.post('/api/objects', 
                              headers=auth_headers,
                              json={
                                  'name': 'Test Camera',
                                  'description': 'Test camera'
                              })
    object_id = obj_response.json['id']
    
    # 테스트 이미지 생성 (1x1 픽셀)
    test_image = base64.b64encode(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x02\x00\x01\xe5\x27\xde\xfc\x00\x00\x00\x00IEND\xaeB`\x82').decode()
    
    response = client.post(f'/api/objects/{object_id}/detect',
                          headers=auth_headers,
                          json={
                              'frame_data': f'data:image/png;base64,{test_image}'
                          })
    
    assert response.status_code == 200
    assert 'result' in response.json