import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>최근 탐지</Text>
      <FlatList
        data={detections}
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

      <Text style={styles.sectionTitle}>최근 알림</Text>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertSummaryCard
            item={item}
            onPress={() =>
              navigation.navigate('Detection', {
                screen: 'Detail',
                params: { id: item.id },
              })
            }
          />
        )}
        scrollEnabled={false}
        contentContainerStyle={styles.alertListContainer}
      />
    </View>
  );
};

export default MainScreen;