import { StyleSheet } from 'react-native';

const ChartStyles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  chart: {
    borderRadius: 8,
  },
});

export const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 8,
  },
};

export default ChartStyles;