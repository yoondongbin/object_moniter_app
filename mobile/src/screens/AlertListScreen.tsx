import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import styles from '../styles/AlertListScreen.styles';
import { getAlerts, type AlertItem } from '../services/api/alertApi';
import AlertSummaryCard from '../components/AlertSummaryCard';

export default function AlertListScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    getAlerts().then(setAlerts);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>전체 알림 목록</Text>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertSummaryCard item={item} onPress={() => {}} />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}
