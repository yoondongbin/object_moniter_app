import { StyleSheet } from 'react-native';

const AlertSummaryCardStyles = StyleSheet.create({
  card: {
    padding: 12,
    backgroundColor: '#fff3f3',
    borderColor: '#f99',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
  },
  alertText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#b00',
  },
  time: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
});

export default AlertSummaryCardStyles;
