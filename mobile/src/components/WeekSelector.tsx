import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import styles from '../styles/WeekSelector.styles'

type Props = {
    selectedOffset: number; // 0: 이번주, 1: 지난주, 2: 그저께, 3: 그저저번주
    onChange: (offset: number) => void;
}

const maxWeeks = 12;

const generateWeekLabels = (count: number) => {
    return Array.from({ length: count + 1 }, (_, i) =>
        i === 0 ? '이번 주' : `${i}주 전`
    )
}

export default function WeekSelector({ selectedOffset, onChange }: Props) {
    const weekLabels = generateWeekLabels(maxWeeks);

  return (
    <View style={styles.container}>
      {weekLabels.map((label, index) => (
        <TouchableOpacity
            key={index}
            style={[
                styles.button,
                selectedOffset === index && styles.selectedButton,
            ]}
            onPress={() => onChange(index)}
        >
            <Text
                style={[
                    styles.buttonText,
                    selectedOffset === index && styles.selectedButtonText,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}