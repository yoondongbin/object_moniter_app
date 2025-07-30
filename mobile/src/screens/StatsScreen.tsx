import React, { useState } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/StatsScreen.styles';
import WeekSelector from '../components/WeekSelector';
import Chart from '../components/Chart';
import { dummyStats } from '../data/dummyStats';
import { DailyStats } from '../data/dummyStats';
import { getStatsByWeekOffset } from '../utils/statsUtils';

export default function StatsScreen() {
    const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0: 이번주, 1: 지난주, 2: 그저께, 3: 그저저번주
    const fileteredData: DailyStats[] = getStatsByWeekOffset(dummyStats, selectedWeekOffset); 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>주간 탐지 통계</Text>
      <WeekSelector selectedOffset={selectedWeekOffset} onChange={setSelectedWeekOffset} />
      <Chart data={fileteredData}></Chart>
    </View>
  )
}