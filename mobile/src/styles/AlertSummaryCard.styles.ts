import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export default StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  severity: {
    fontSize: 12,
    fontWeight: '600',
  },
  high: {
    color: Colors.danger,
  },
  medium: {
    color: Colors.warning,
  },
  low: {
    color: Colors.success,
  },
  time: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
  },
});
