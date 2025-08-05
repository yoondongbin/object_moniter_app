import React from 'react';
import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from '../styles/WeekSelector.styles';

interface Props {
    selectedOffset: number;
    onChange: (offset: number) => void;
    maxWeeks?: number; // 최대 주 수 (선택사항)
  }
  
  const WeekSelector = ({ selectedOffset, onChange, maxWeeks = 12 }: Props) => {
    // 기본적으로 최근 12주간의 데이터를 보여줌
    const options = Array.from({ length: maxWeeks }, (_, i) => ({
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