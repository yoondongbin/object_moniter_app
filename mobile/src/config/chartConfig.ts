const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 8,
  },
  propsForLabels: {
    fontSize: 10   
  },
  propsForBackgroundLines: {
    stroke: '#e3e3e3',
  },
  propsForVerticalLabels: {
    fontSize: 9,
    fill: '#333333',
  },
  propsForHorizontalLabels: {
    fontSize: 9,
    fill: '#666666',
  },
};

export default chartConfig;