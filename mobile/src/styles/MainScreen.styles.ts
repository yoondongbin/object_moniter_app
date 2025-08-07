import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 32,
    minHeight: '100%',
  },
  
  // 헤더 스타일
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  logoutButton: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  // 이미지 선택 카드
  imageSelectionCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageSelectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  detectionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  detectionButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  detectionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // 이미지 미리보기
  imagePreviewContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  imagePreview: {
    width: 280,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: Colors.gray100,
  },
  imageActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  startDetectionButton: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  startDetectionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  clearImageButton: {
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  clearImageButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // 섹션 스타일
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 28,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  moreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  moreButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // 리스트
  listContainer: {
    paddingBottom: 8,
    paddingLeft: 4,
  },
  
  // 빈 상태 카드
  emptyContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  emptyContainerDashed: {
    backgroundColor: Colors.gray50,
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});