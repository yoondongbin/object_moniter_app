import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  listContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 8,
  },
  alertListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  moreButtonContainer: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginTop: 8,
  },
  moreButtonText: {
    color: '#007aff',
    fontSize: 14,
  },
  detectionButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  detectionButton: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectionButtonDisabled: {
    backgroundColor: '#ccc',
  },
  detectionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  imageActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  startDetectionButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  startDetectionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearImageButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  clearImageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});