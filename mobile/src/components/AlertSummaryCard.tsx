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
          <Text style={styles.type}>{item.type}</Text>
          <Text 
            style={[
              styles.severity,
              item.type === 'warning' ? styles.high : item.type === '중간' ? styles.medium : styles.low,
            ]}
          >{item.type}</Text>
        </View>
        <Text style={styles.time}>{item.created_at}</Text>
      </TouchableOpacity>
    );
  }