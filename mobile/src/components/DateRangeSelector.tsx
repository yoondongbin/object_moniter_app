// DateRangeSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from '../styles/DateRangeSelector.styles';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  chartWidth?: number;
}

const DateRangeSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange, chartWidth }: Props) => {
  const [showStartPicker, setShowStartPicker] = React.useState(false);
  const [showEndPicker, setShowEndPicker] = React.useState(false);
  const [activeButton, setActiveButton] = React.useState<'start' | 'end' | null>(null);

  // 날짜 범위 계산
  const daysDifference = differenceInDays(endDate, startDate) + 1;

  // 프리셋 날짜 범위 설정
  const handlePresetRange = (days: number) => {
    const newEndDate = new Date();
    const newStartDate = new Date();
    newStartDate.setDate(newStartDate.getDate() - days + 1);
    
    onStartDateChange(newStartDate);
    onEndDateChange(newEndDate);
  };

  const handleStartDatePress = () => {
    try {
      setActiveButton('start');
      setShowStartPicker(true);
    } catch (error) {
      console.error('DatePicker 오류:', error);
      Alert.alert(
        '날짜 선택 오류',
        '날짜 선택기를 열 수 없습니다. 프리셋 버튼을 사용해보세요.',
        [{ text: '확인' }]
      );
    }
  };

  const handleEndDatePress = () => {
    try {
      setActiveButton('end');
      setShowEndPicker(true);
    } catch (error) {
      console.error('DatePicker 오류:', error);
      Alert.alert(
        '날짜 선택 오류',
        '날짜 선택기를 열 수 없습니다. 프리셋 버튼을 사용해보세요.',
        [{ text: '확인' }]
      );
    }
  };

  const handleStartDateConfirm = (date: Date) => {
    try {
      onStartDateChange(date);
      setShowStartPicker(false);
      setActiveButton(null);
    } catch (error) {
      console.error('날짜 설정 오류:', error);
      setShowStartPicker(false);
      setActiveButton(null);
    }
  };

  const handleEndDateConfirm = (date: Date) => {
    try {
      onEndDateChange(date);
      setShowEndPicker(false);
      setActiveButton(null);
    } catch (error) {
      console.error('날짜 설정 오류:', error);
      setShowEndPicker(false);
      setActiveButton(null);
    }
  };

  const handleCancel = () => {
    setShowStartPicker(false);
    setShowEndPicker(false);
    setActiveButton(null);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 조회 기간 설정</Text>
        <Text style={styles.headerSubtitle}>시작일과 종료일을 선택하세요</Text>
      </View>

      {/* 프리셋 버튼들 */}
      <View style={styles.presetContainer}>
        <TouchableOpacity 
          style={styles.presetButton} 
          onPress={() => handlePresetRange(7)}
        >
          <Text style={styles.presetText}>7일</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.presetButton} 
          onPress={() => handlePresetRange(14)}
        >
          <Text style={styles.presetText}>2주</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.presetButton} 
          onPress={() => handlePresetRange(30)}
        >
          <Text style={styles.presetText}>1개월</Text>
        </TouchableOpacity>
      </View>

      {/* 날짜 선택 버튼 */}
      <View style={styles.selectorRow}>
        <TouchableOpacity 
          style={[
            styles.dateButton, 
            activeButton === 'start' && styles.dateButtonActive
          ]} 
          onPress={handleStartDatePress}
        >
          <Text style={styles.dateLabel}>시작일</Text>
          <Text style={[
            styles.dateText, 
            activeButton === 'start' && styles.dateTextActive
          ]}>
            {format(startDate, 'MM월 dd일', { locale: ko })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.dateButton, 
            activeButton === 'end' && styles.dateButtonActive
          ]} 
          onPress={handleEndDatePress}
        >
          <Text style={styles.dateLabel}>종료일</Text>
          <Text style={[
            styles.dateText, 
            activeButton === 'end' && styles.dateTextActive
          ]}>
            {format(endDate, 'MM월 dd일', { locale: ko })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 날짜 범위 요약 */}
      <View style={styles.rangeSummary}>
        <Text style={styles.rangeSummaryText}>
          {format(startDate, 'yyyy.MM.dd')} ~ {format(endDate, 'yyyy.MM.dd')}
        </Text>
        <Text style={styles.rangeDuration}>
          총 {daysDifference}일간의 데이터
        </Text>
      </View>

      {/* 시작일 선택 모달 - 에러 핸들링 포함 */}
      {Platform.OS === 'ios' || Platform.OS === 'android' ? (
        <DateTimePickerModal
          isVisible={showStartPicker}
          mode="date"
          date={startDate}
          maximumDate={endDate} // 종료일 이후 선택 불가
          onConfirm={handleStartDateConfirm}
          onCancel={handleCancel}
          confirmTextIOS="확인"
          cancelTextIOS="취소"
        />
      ) : null}

      {/* 종료일 선택 모달 - 에러 핸들링 포함 */}
      {Platform.OS === 'ios' || Platform.OS === 'android' ? (
        <DateTimePickerModal
          isVisible={showEndPicker}
          mode="date"
          date={endDate}
          minimumDate={startDate} // 시작일 이전 선택 불가
          maximumDate={new Date()} // 오늘 이후 선택 불가
          onConfirm={handleEndDateConfirm}
          onCancel={handleCancel}
          confirmTextIOS="확인"
          cancelTextIOS="취소"
        />
      ) : null}
    </View>
  );
};

export default DateRangeSelector;
