import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/StatsScreen.styles';
import WeekSelector from '../components/WeekSelector';
import Chart from '../components/Chart';
import { getStatsByWeek, type DailyStats } from '../services/api/statsApi';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

export default function StatsScreen() {
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [data, setData] = useState<DailyStats[]>([]);

  useEffect(() => {
    getStatsByWeek(selectedWeekOffset).then(setData);
  }, [selectedWeekOffset]);

  const chartData = {
    labels: data.map((d) => {
      const date = dayjs(d.date);
      return date.format('M/D\ndd');
    }),
    datasets: [{ data: data.map((d) => d.count) }],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>주간 탐지 통계</Text>
      <WeekSelector
        selectedOffset={selectedWeekOffset}
        onChange={setSelectedWeekOffset}
      />
      <Chart data={chartData} />
    </View>
  );
}
