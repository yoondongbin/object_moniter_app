import base64
import requests
import sys

def send_image_for_detection(object_id, image_path, access_token):
    """이미지 파일을 Base64로 변환하여 탐지 API 호출"""
    
    try:
        # 1. 이미지 파일을 Base64로 인코딩
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()
            base64_data = base64.b64encode(image_data).decode('utf-8')
        
        # 2. API 호출
        response = requests.post(
            f'http://127.0.0.1:5001/api/objects/{object_id}/detect',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            json={
                'frame_data': f'data:image/jpeg;base64,{base64_data}'
            }
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ API 호출 실패: {response.status_code}")
            print(f"응답: {response.text}")
            return None
            
    except FileNotFoundError:
        print(f"❌ 이미지 파일을 찾을 수 없습니다: {image_path}")
        return None
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        return None

def main():
    """메인 함수 - 명령행 인수로 실행"""
    if len(sys.argv) != 4:
        print("사용법: python send_image.py <object_id> <image_path> <access_token>")
        print("예시: python send_image.py 1 test_image.jpg eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...")
        return
    
    object_id = int(sys.argv[1])
    image_path = sys.argv[2]
    access_token = sys.argv[3]
    
    print(f"🔍 이미지 탐지 시작...")
    print(f"Object ID: {object_id}")
    print(f"이미지 경로: {image_path}")
    
    result = send_image_for_detection(object_id, image_path, access_token)
    
    if result:
        print("✅ 탐지 완료!")
        print(f"위험도: {result.get('result', {}).get('danger_level', 'unknown')}")
        print(f"탐지된 객체 수: {len(result.get('result', {}).get('detected_objects', []))}")
        print(f"알림 메시지: {result.get('result', {}).get('alert_message', 'N/A')}")
    else:
        print("❌ 탐지 실패")

if __name__ == "__main__":
    main()