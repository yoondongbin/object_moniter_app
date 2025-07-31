import React from 'react';
import { View, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import styles from '../styles/Chart.styles';
import chartConfig from '../config/chartConfig';

const screenWidth = Dimensions.get('window').width;

interface Props {
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
}

export default function Chart({ data }: Props) {
  return (
    <View style={styles.container}>
      <BarChart
        data={data}
        width={screenWidth - 44}
        height={320}
        fromZero
        yAxisSuffix=""
        yAxisInterval={1}
        showValuesOnTopOfBars
        yAxisLabel="탐지 횟수"
        chartConfig={chartConfig}
        style={styles.chart}
        showBarTops={false}
        verticalLabelRotation={0}
        horizontalLabelRotation={0}
      />
    </View>
  );
}
