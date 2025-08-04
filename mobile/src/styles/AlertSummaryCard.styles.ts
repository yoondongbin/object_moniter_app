import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    backgroundColor: '#fff5f5',
    borderColor: '#ff9999',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#d93025',
  },
  severity: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  high: {
    color: '#d93025',
  },
  medium: {
    color: '#f9ab00',
  },
  low: {
    color: '#188038',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
});
