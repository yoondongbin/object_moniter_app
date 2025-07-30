import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { DetectionSummary } from '../data/summaryDetections'
import styles from '../styles/DetectionSummaryCard.styles'

type Props = {
    item: DetectionSummary;
    onPress: () => void;
}

export default function DetectionSummaryCard({ item, onPress }: Props){
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.thumbnail}>
                <Text style={styles.thumbText}>{item.thumbnail}</Text>
            </View>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.time}>{item.time}</Text>
        </TouchableOpacity>
    )
}