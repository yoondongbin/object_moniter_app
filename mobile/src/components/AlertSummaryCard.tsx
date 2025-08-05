import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/AlertSummaryCard.styles';
import { NotificationData } from '../services/api/notificationApi';

type Props = {
  item: NotificationData;
  onPress: () => void;
};

export default function AlertSummaryCard({ item, onPress }: Props) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.row}>
          <Text style={styles.type}>{item.title}</Text>
          <Text 
            style={[
              styles.severity,
              item.notification_type === 'high' ? styles.high : item.notification_type === 'medium' ? styles.medium : styles.low,
            ]}
          >{item.notification_type}</Text>
        </View>
        <Text style={styles.time}>{item.created_at}</Text>
      </TouchableOpacity>
    );
  }