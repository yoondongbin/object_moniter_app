import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '../styles/MainScreen.styles';

const MainScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 1. 탐지 결과 리스트 */}
      <Text style={styles.title}>📋 탐지 결과 리스트</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚗 차량 탐지</Text>
        <Text style={styles.cardDesc}>2024-08-01 14:30 | 위험도: 높음</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 사람 탐지</Text>
        <Text style={styles.cardDesc}>2024-08-01 13:20 | 위험도: 보통</Text>
      </View>

      {/* 2. 알림 푸시 요약 */}
      <Text style={styles.title}>🔔 알림 푸시 요약</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>위험 알림 2건 발생</Text>
        <Text style={styles.cardDesc}>최근 24시간 내 위험 탐지 수: 5건</Text>
      </View>

      {/* 3. 통계 요약 */}
      <Text style={styles.title}>📈 통계 요약</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>오늘 탐지된 객체: 8개</Text>
        <Text style={styles.cardDesc}>가장 많이 탐지된 객체: 사람</Text>
      </View>

      {/* 4. 업로드 버튼 영역 */}
      <Text style={styles.title}>📦 테스트 영상 업로드</Text>
      <View style={styles.card}>
        <Text style={styles.cardDesc}>영상을 업로드하여 탐지 결과 확인하기</Text>
        {/* 이 아래에 업로드 버튼 또는 기능 삽입 예정 */}
      </View>
    </ScrollView>
  );
};

export default MainScreen;