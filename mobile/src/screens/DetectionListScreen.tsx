import React from 'react';
import { View, Text, FlatList } from 'react-native';
import styles from '../styles/DetectionListScreen.styles';
import { dummySummaryDetections } from '../data/summaryDetections';
import DetectionSummaryCard from '../components/DetectionSummaryCard';

const DetectionListScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>전체 탐지 결과</Text>
      <FlatList
        data={dummySummaryDetections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DetectionSummaryCard
            item={item}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default DetectionListScreen;