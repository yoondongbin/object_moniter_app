import React from 'react';
import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from '../styles/WeekSelector.styles';
import { getOldestDate } from '../utils/statsUtils';
import { dummyStats } from '../data/dummyStats';

interface Props {
    selectedOffset: number;
    onChange: (offset: number) => void;
  }
  
  const WeekSelector = ({ selectedOffset, onChange }: Props) => {
    const now = new Date();
    const firstDate = getOldestDate(dummyStats);
    const weekDiff = Math.floor(
      (now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
  
    const options = Array.from({ length: weekDiff + 1 }, (_, i) => ({
      label: i === 0 ? '이번 주' : `${i}주 전`,
      value: i,
    }));
  
    return (
      <View style={styles.container}>
        <Picker
          selectedValue={selectedOffset}
          onValueChange={(value) => onChange(value)}
          style={styles.picker}
        >
          {options.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>
    );
  };
  
  export default WeekSelector;