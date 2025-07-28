import React from 'react'
import { styles } from '../styles/MainScreen.styles'
import { Text, View } from 'react-native'

const DectionList = () => {
  return (
    <>
        <Text style={styles.title}>탐지 결과 리스트</Text>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>차량 탐지</Text>
            <Text style={styles.cardDesc}>2025-07-28 10:00:00 | 위험도: 높음</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>사람 탐지</Text>
            <Text style={styles.cardDesc}>2025-07-28 10:00:00 | 위험도: 높음</Text>
        </View>
    </>
  )
}

export default DectionList