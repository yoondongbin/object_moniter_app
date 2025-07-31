import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/StatsScreen.styles';
import WeekSelector from '../components/WeekSelector';
import Chart from '../components/Chart';
import { getStatsByWeek, type DailyStats } from '../services/api/statsApi';

export default function StatsScreen() {
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [data, setData] = useState<DailyStats[]>([]);

  useEffect(() => {
    getStatsByWeek(selectedWeekOffset).then(setData);
  }, [selectedWeekOffset]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>주간 탐지 통계</Text>
      <WeekSelector
        selectedOffset={selectedWeekOffset}
        onChange={setSelectedWeekOffset}
      />
      <Chart data={data} />
    </View>
  );
}