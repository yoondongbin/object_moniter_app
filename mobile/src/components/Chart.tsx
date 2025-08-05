import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import styles from '../styles/Chart.styles';
import chartConfig from '../config/chartConfig';
import { 
  CHART_CONFIG, 
  CHART_COLORS, 
  CHART_TYPE_CONFIG, 
  getResponsiveChartSize,
  getChartDatasetColors 
} from '../constants/chartConstants';

const screenWidth = Dimensions.get('window').width;

interface ChartDataset {
  data: number[];
  color?: (opacity?: number) => string;
  strokeWidth?: number;
}

interface Props {
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
  type?: 'bar' | 'line';
  showLegend?: boolean;
  legendLabels?: string[];
  chartWidth?: number;
  chartHeight?: number;
}

export default function Chart({ 
  data, 
  type = 'bar', 
  showLegend = false, 
  legendLabels = [],
  chartWidth,
  chartHeight
}: Props) {
  // 엄격한 데이터 유효성 검사
  if (!data || !data.labels || !data.datasets) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>차트 데이터가 없습니다</Text>
      </View>
    );
  }

  if (data.labels.length === 0 || data.datasets.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>표시할 데이터가 없습니다</Text>
      </View>
    );
  }

  // 각 데이터셋의 data 배열이 유효한지 확인
  const validDatasets = data.datasets.filter(dataset => 
    dataset && 
    dataset.data && 
    Array.isArray(dataset.data) && 
    dataset.data.length > 0 &&
    dataset.data.length === data.labels.length
  );

  if (validDatasets.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>유효한 데이터셋이 없습니다</Text>
      </View>
    );
  }

  // 안전한 차트 데이터 생성
  const safeChartData = {
    labels: data.labels,
    datasets: validDatasets.map((dataset, index) => ({
      data: dataset.data.map(value => typeof value === 'number' && !isNaN(value) ? value : 0),
      color: dataset.color || ((opacity = 1) => getChartDatasetColors(index).replace('1)', `${opacity})`)),
      strokeWidth: dataset.strokeWidth || CHART_TYPE_CONFIG.line.withDots ? 3 : 2,
    }))
  };

  // 선 그래프용 설정 (상수 사용)
  const lineChartConfig = {
    ...chartConfig,
    decimalPlaces: 0,
    color: (opacity = 1) => CHART_COLORS.PRIMARY.replace('1)', `${opacity})`),
    strokeWidth: 3,
    useShadowColorFromDataset: true,
    fillShadowGradient: CHART_COLORS.PRIMARY_GRADIENT,
    fillShadowGradientOpacity: 0.1,
  };

  // 반응형 차트 크기 계산 (상수 기반)
  const responsiveSize = getResponsiveChartSize(chartWidth, chartHeight);
  const finalChartWidth = responsiveSize.width;
  const finalChartHeight = responsiveSize.height;

  return (
    <View style={styles.container}>
      {type === 'line' ? (
        <LineChart
          data={safeChartData}
          width={finalChartWidth}
          height={finalChartHeight}
          fromZero={true}
          yAxisLabel=""
          yAxisSuffix="건"
          chartConfig={lineChartConfig}
          style={styles.chart}
          {...CHART_TYPE_CONFIG.line} // 상수에서 모든 설정 가져오기
        />
      ) : (
        <BarChart
          data={safeChartData}
          width={finalChartWidth}
          height={finalChartHeight}
          yAxisLabel=""
          yAxisSuffix="건"
          yAxisInterval={1}
          chartConfig={chartConfig}
          style={styles.chart}
          {...CHART_TYPE_CONFIG.bar} // 상수에서 bar 설정 가져오기
        />
      )}
      
      {/* 범례 표시 */}
      {showLegend && legendLabels.length > 0 && (
        <View style={styles.legendContainer}>
          {legendLabels.map((label, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { 
                    backgroundColor: index === 0 
                      ? '#8B5CF6'  // 보라색 (전체 탐지)
                      : '#EF4444'  // 빨간색 (위험 탐지)
                  }
                ]} 
              />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
