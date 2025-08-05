// DateRangeSelector.styles.ts
import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export default StyleSheet.create({
  container: {
    // 컨테이너 스타일은 부모에서 관리하므로 최소화
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  
  // 프리셋 버튼들
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 8,
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dateButtonActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  dateTextActive: {
    color: '#8B5CF6',
  },
  
  // 날짜 범위 표시
  rangeSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  rangeSummaryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  rangeDuration: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
});