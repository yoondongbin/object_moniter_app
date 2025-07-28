import React from 'react'
import { styles } from '../styles/MainScreen.styles'
import { Text, View } from 'react-native'
const AlertSummary = () => {
  return (
    <>
        <Text style={styles.title}>탐지 결과 요약</Text>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>위험 알림 2건</Text>
            <Text style={styles.cardDesc}>최근 24시간 내 위험 탐지 발생</Text>
        </View>
    </>
  )
}

export default AlertSummary