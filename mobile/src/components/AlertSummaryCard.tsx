import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/AlertSummaryCard.styles';
import { AlertSummary } from '../data/summaryAlerts';

type Props = {
  item: AlertSummary;
  onPress: () => void;
};

export default function AlertSummaryCard({ item, onPress }: Props) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <Text style={styles.alertText}>{item.type}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </TouchableOpacity>
    );
  }