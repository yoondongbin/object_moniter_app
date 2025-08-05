import { StyleSheet } from 'react-native';
import { Colors } from './colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent', // 부모 컨테이너에서 배경 관리
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  
  // 빈 데이터 상태
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 60,
    fontWeight: '500',
  },
  
  // 범례 스타일
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});

export default styles;