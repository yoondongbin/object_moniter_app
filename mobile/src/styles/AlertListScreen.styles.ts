import { StyleSheet } from 'react-native';
import { Colors } from './colors';

const AlertListScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  
  // 로딩 상태 스타일
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // 빈 상태 관련 스타일
  emptyStateContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 40,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AlertListScreenStyles;
