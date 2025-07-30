import React from 'react';
import { View, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { DailyStats } from '../data/dummyStats';
import styles, { chartConfig } from '../styles/Chart.styles';

type Props = {
    data: DailyStats[];
}

const screenWidth = Dimensions.get('window').width;

export default function Chart({ data }: Props) {
    const chartData = {
        labels: data.map((d) => d.date.slice(5)), // 월일만 추출
        datasets: [{ data: data.map((d) => d.count) }],
    }
  return (
    <View style={styles.container}>
      <BarChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        fromZero={true}
        chartConfig={chartConfig}
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix=""
      />
    </View>
  )
}