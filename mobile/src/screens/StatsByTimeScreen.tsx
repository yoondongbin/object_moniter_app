import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getStatsByWeek } from '../services/api/statsApi';
import { getStatsByWeekOffset } from '../utils/statsUtils';
import { DailyStats } from '../services/api/statsApi';
import { Dropdown } from 'react-native-element-dropdown';
import Chart from '../components/Chart';
import styles from '../styles/StatsByTimeScreen.styles';
import chartConfig from '../config/chartConfig';

const weekOptions = [
  { label: '이번 주', value: 0 },
  { label: '지난 주', value: 1 },
  { label: '2주 전', value: 2 },
];

export default function StatsByTimeScreen() {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [stats, setStats] = useState<DailyStats[]>([]);

  useEffect(() => {
    fetchStats();
  }, [selectedWeek]);

  const fetchStats = async () => {
    const data = await getStatsByWeek(selectedWeek);
    setStats(data);
  };

  const chartData = {
    labels: stats.map(item => item.date.slice(5).replace('-', '/')), // MM/DD
    datasets: [{ data: stats.map(item => item.count) }],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>주간 탐지 통계</Text>
      <Dropdown
        data={weekOptions}
        labelField="label"
        valueField="value"
        value={selectedWeek}
        onChange={item => setSelectedWeek(item.value)}
        style={styles.dropdown}
        selectedTextStyle={styles.dropdownText}
      />
      <Chart
        data={chartData}
      />
    </View>
  );
}
