import { StyleSheet } from 'react-native';

const WeekSelectorStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedButton: {
    backgroundColor: '#007aff',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WeekSelectorStyles;