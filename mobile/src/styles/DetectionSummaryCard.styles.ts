import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from './colors';

const screenWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  card: {
    width: screenWidth * 0.44,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
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
});
