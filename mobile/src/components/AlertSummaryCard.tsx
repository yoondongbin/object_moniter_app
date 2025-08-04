import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/AlertSummaryCard.styles';
import { AlertItem } from '../services/api/alertApi';

type Props = {
  item: AlertItem;
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
              item.severity === '높음' ? styles.high : item.severity === '중간' ? styles.medium : styles.low,
            ]}
          >{item.severity}</Text>
        </View>
        <Text style={styles.time}>{item.time}</Text>
      </TouchableOpacity>
    );
  }