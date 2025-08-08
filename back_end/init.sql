-- Object Monitor 데이터베이스 초기화 스크립트

-- 데이터베이스가 존재하지 않으면 생성
CREATE DATABASE IF NOT EXISTS object_monitor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 데이터베이스 사용
USE object_monitor;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 객체 테이블
CREATE TABLE IF NOT EXISTS object (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'inactive',
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 모니터링 로그 테이블
CREATE TABLE IF NOT EXISTS monitoring_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    object_id INT,
    event_type VARCHAR(50) NOT NULL,
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (object_id) REFERENCES object(id) ON DELETE CASCADE
);

-- 객체 탐지 결과 테이블
CREATE TABLE IF NOT EXISTS detection_result (
    id INT AUTO_INCREMENT PRIMARY KEY,
    object_id INT,
    detection_type VARCHAR(50) NOT NULL,
    object_class VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    bbox_x INT,
    bbox_y INT,
    bbox_width INT,
    bbox_height INT,
    danger_level VARCHAR(20) NOT NULL,
    image_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (object_id) REFERENCES object(id) ON DELETE CASCADE
);

-- 알림 테이블
CREATE TABLE IF NOT EXISTS notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    detection_id INT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (detection_id) REFERENCES detection_result(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_user_username ON user(username);
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_object_user_id ON object(user_id);
CREATE INDEX idx_monitoring_log_object_id ON monitoring_log(object_id);
CREATE INDEX idx_monitoring_log_timestamp ON monitoring_log(timestamp);
CREATE INDEX idx_detection_result_object_id ON detection_result(object_id);
CREATE INDEX idx_detection_result_created_at ON detection_result(created_at);
CREATE INDEX idx_notification_user_id ON notification(user_id);
CREATE INDEX idx_notification_detection_id ON notification(detection_id);
CREATE INDEX idx_notification_created_at ON notification(created_at);
