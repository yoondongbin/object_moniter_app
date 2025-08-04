import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import styles from '../styles/AlertListScreen.styles';
import { NotificationService, type NotificationData } from '../services/api/notificationApi';
import AlertSummaryCard from '../components/AlertSummaryCard';

export default function AlertListScreen() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await NotificationService.getInstance().getNotifications();
        if (response.success && Array.isArray(response.data)) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error('알림 로드 실패:', error);
      }
    };
    loadNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>전체 알림 목록</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id?.toString() || ''}
        renderItem={({ item }) => (
          <AlertSummaryCard item={item} onPress={() => {}} />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}
