import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  card: {
    width: screenWidth * 0.42,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#ddd',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#555',
  },
  riskText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  riskHigh: {
    color: '#d93025',
  },
  riskMedium: {
    color: '#f9ab00',
  },
  riskLow: {
    color: '#188038',
  },
  time: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },
});
