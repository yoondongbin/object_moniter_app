import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import styles from '../styles/MainScreen.styles';
import { getDetections } from '../services/api/detectionApi';
import { getAlerts } from '../services/api/alertApi';
import DetectionSummaryCard from '../components/DetectionSummaryCard';
import AlertSummaryCard from '../components/AlertSummaryCard';
import type { DetectionItem } from '../services/api/detectionApi';
import type { AlertItem } from '../services/api/alertApi';

const MainScreen = ({ navigation }: any) => {
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    getDetections().then(setDetections);
    getAlerts().then(setAlerts);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>최근 탐지</Text>

      <FlatList
        data={detections.slice(0, 5)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DetectionSummaryCard
            item={item}
            onPress={() =>
              navigation.navigate('Detection', {
                screen: 'Detail',
                params: { id: item.id },
              })
            }
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* 탐지 전체 보기 버튼 */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Detection', { screen: 'DetectionList' })}
        style={styles.moreButtonContainer}
      >
        <Text style={styles.moreButtonText}>탐지 전체 보기</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>최근 알림</Text>
      <FlatList
        data={alerts.slice(0, 5)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertSummaryCard
            item={item}
            onPress={() =>
              navigation.navigate('Detection', {
                screen: 'Detail',
                params: { id: item.detectionId },
              })
            }
          />
        )}
        scrollEnabled={false}
        contentContainerStyle={styles.alertListContainer}
      />

      {/* 알림 전체 보기 버튼 */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Detection', {
            screen: 'AlertList',
          })
        }
        style={styles.moreButtonContainer}
      >
        <Text style={styles.moreButtonText}>알림 전체 보기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default MainScreen;
