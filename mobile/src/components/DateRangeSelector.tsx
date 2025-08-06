// DateRangeSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/DateRangeSelector.styles';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import CalendarPicker from './CalendarPicker';

interface Props {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  chartWidth?: number;
}

const DateRangeSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange }: Props) => {
  const [showCalendarPicker, setShowCalendarPicker] = React.useState(false);

  // 날짜 범위 계산
  const daysDifference = differenceInDays(endDate, startDate) + 1;

  const handleCalendarPress = () => {
    setShowCalendarPicker(true);
  };

  const handleCalendarConfirm = (startDate: Date, endDate: Date) => {
    onStartDateChange(startDate);
    onEndDateChange(endDate);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 조회 기간 설정</Text>
        <Text style={styles.headerSubtitle}>시작일과 종료일을 선택하세요</Text>
      </View>

      {/* 날짜 정보 표시 */}
      <View style={styles.selectorRow}>
        <View style={styles.dateInfo}>
          <Text style={styles.dateLabel}>시작일</Text>
          <Text style={styles.dateText}>
            {format(startDate, 'MM월 dd일', { locale: ko })}
          </Text>
        </View>

        <View style={styles.dateInfo}>
          <Text style={styles.dateLabel}>종료일</Text>
          <Text style={styles.dateText}>
            {format(endDate, 'MM월 dd일', { locale: ko })}
          </Text>
        </View>
      </View>

      {/* 기간 설정 버튼 */}
      <View style={styles.calendarButtonContainer}>
        <TouchableOpacity 
          style={styles.calendarButton} 
          onPress={handleCalendarPress}
        >
          <Text style={styles.calendarButtonText}>📅 기간 설정</Text>
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

      {/* 캘린더 피커 모달 */}
      <CalendarPicker
        isVisible={showCalendarPicker}
        onClose={() => setShowCalendarPicker(false)}
        onConfirm={handleCalendarConfirm}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </View>
  );
};

export default DateRangeSelector;
