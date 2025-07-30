import { StyleSheet } from 'react-native';

const DetectionSummaryCardStyles = StyleSheet.create({
  card: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 60,
    backgroundColor: '#ccc',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  thumbText: {
    fontSize: 12,
    color: '#444',
  },
  label: {
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default DetectionSummaryCardStyles;
