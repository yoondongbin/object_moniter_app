import React from 'react'
import { styles } from '../styles/MainScreen.styles'
import { Text, View } from 'react-native'

const StatsOverview = () => {
  return (
    <>
        <Text style={styles.title}>통계 요약</Text>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>오늘 탐지 퇸 객체: 8개</Text>
            <Text style={styles.cardDesc}>가장 많이 탐지된 객체: 사람</Text>
        </View>
    </>
  )
}

export default StatsOverview