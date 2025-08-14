import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/AlertSummaryCard.styles';
import { NotificationData } from '../services/api';
import { formatDateTime } from '../utils/dateUtils';

type Props = {
  item: NotificationData;
  onPress: () => void;
};

export default function AlertSummaryCard({ item, onPress }: Props) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.row}>
          <Text style={styles.type}>{(item as any).title || item.message}</Text>
          <Text 
            style={[
              styles.severity,
              (item as any).notification_type === 'high' ? styles.high : 
              (item as any).notification_type === 'medium' ? styles.medium : styles.low,
            ]}
          >{(item as any).notification_type || 'low'}</Text>
        </View>
        <Text style={styles.time}>{formatDateTime(item.created_at)}</Text>
      </TouchableOpacity>
    );
  }