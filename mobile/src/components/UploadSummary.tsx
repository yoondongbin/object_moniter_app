import React from 'react'
import { styles } from '../styles/MainScreen.styles';
import { Text, TouchableOpacity, View } from 'react-native';


const UploadSummary = () => {
  return (
    <>
        <Text style={styles.title}>테스트 영상 업로드</Text>
        <View style={styles.card}>
            <Text style={styles.cardDesc}>총 업로드된 영상: 5건</Text>
            <TouchableOpacity style={{ marginTop: 8 }}>
                <Text style={{ color: 'blue' }}>영상 업로드</Text>
            </TouchableOpacity>
        </View>
    </>    
  )
}

export default UploadSummary