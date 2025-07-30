// src/styles/MainScreen.styles.ts

import { StyleSheet } from 'react-native';

const MainScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  alertListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});

export default MainScreenStyles;
