import { StyleSheet } from 'react-native';

const WeekSelectorStyles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 16,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
  },
  picker: {
    height: 52,           // 기존보다 살짝 여유 있는 높이
    fontSize: 16,         // 텍스트 가시성 확보
    lineHeight: 22,       // 줄 간격 확보
    paddingVertical: 6,
    textAlignVertical: 'center',
  },
});

export default WeekSelectorStyles;