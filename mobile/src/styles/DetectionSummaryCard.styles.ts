import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from './colors';

// 상수 정의 - 유지보수성 향상
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_HORIZONTAL_MARGIN = 16;
const GRID_CONTAINER_PADDING = 48; // 좌우 패딩 + 마진 총합
const GRID_COLUMNS = 2;
const HORIZONTAL_CARD_WIDTH_RATIO = 0.42;

export default StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * HORIZONTAL_CARD_WIDTH_RATIO,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: Colors.gray100,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  riskHigh: {
    color: Colors.danger,
  },
  riskMedium: {
    color: Colors.warning,
  },
  riskLow: {
    color: Colors.success,
  },
  time: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 8,
  },
  
  // 그리드 레이아웃용 스타일 - 2열 그리드에 최적화
  gridCard: {
    width: (SCREEN_WIDTH - GRID_CONTAINER_PADDING) / GRID_COLUMNS,
    marginRight: 0,
    marginBottom: CARD_HORIZONTAL_MARGIN,
  },
  lastInRow: {
    marginRight: 0,
  },
});
