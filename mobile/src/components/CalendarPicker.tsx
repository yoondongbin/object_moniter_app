import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import styles from '../styles/CalendarPicker.styles';

interface CalendarPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  isVisible,
  onClose,
  onConfirm,
  initialStartDate = new Date(),
  initialEndDate = new Date(),
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(initialStartDate);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(initialEndDate);
  const [selectionMode, setSelectionMode] = useState<'start' | 'end'>('start');

  useEffect(() => {
    if (isVisible) {
      setSelectedStartDate(initialStartDate);
      setSelectedEndDate(initialEndDate);
      setCurrentMonth(initialStartDate);
      setSelectionMode('start');
    }
  }, [isVisible, initialStartDate, initialEndDate]);

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    
    // 이전 달의 마지막 날들 추가
    const firstDayOfWeek = start.getDay();
    const prevMonth = subMonths(date, 1);
    const prevMonthEnd = endOfMonth(prevMonth);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.unshift(new Date(prevMonthEnd.getTime() - i * 24 * 60 * 60 * 1000));
    }
    
    // 다음 달의 첫 날들 추가
    const lastDayOfWeek = end.getDay();
    const nextMonth = addMonths(date, 1);
    const nextMonthStart = startOfMonth(nextMonth);
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      days.push(new Date(nextMonthStart.getTime() + (i - 1) * 24 * 60 * 60 * 1000));
    }
    
    return days;
  };

  const handleDatePress = (date: Date) => {
    if (selectionMode === 'start') {
      if (selectedEndDate && date > selectedEndDate) {
        Alert.alert('알림', '시작일은 종료일보다 이전이어야 합니다.');
        return;
      }
      setSelectedStartDate(date);
      setSelectionMode('end');
    } else {
      if (selectedStartDate && date < selectedStartDate) {
        Alert.alert('알림', '종료일은 시작일보다 이후여야 합니다.');
        return;
      }
      setSelectedEndDate(date);
      setSelectionMode('start');
    }
  };

  const handleConfirm = () => {
    if (selectedStartDate && selectedEndDate) {
      onConfirm(selectedStartDate, selectedEndDate);
      onClose();
    } else {
      Alert.alert('알림', '시작일과 종료일을 모두 선택해주세요.');
    }
  };

  const handleCancel = () => {
    setSelectedStartDate(initialStartDate);
    setSelectedEndDate(initialEndDate);
    setSelectionMode('start');
    onClose();
  };

  const isDateSelected = (date: Date) => {
    return (
      (selectedStartDate && isSameDay(date, selectedStartDate)) ||
      (selectedEndDate && isSameDay(date, selectedEndDate))
    );
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return isWithinInterval(date, { start: selectedStartDate, end: selectedEndDate });
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  };

  const renderDay = (date: Date, index: number) => {
    const isSelected = isDateSelected(date);
    const isInRange = isDateInRange(date);
    const isCurrentMonth = isDateInCurrentMonth(date);
    const isToday = isSameDay(date, new Date());
    const isStartDate = selectedStartDate && isSameDay(date, selectedStartDate);
    const isEndDate = selectedEndDate && isSameDay(date, selectedEndDate);

    // 범위 내 날짜의 위치에 따른 스타일 결정
    let rangeStyle = null;
    if (isInRange && !isSelected) {
      const dayOfWeek = date.getDay();
      const isFirstInRow = dayOfWeek === 0;
      const isLastInRow = dayOfWeek === 6;
      
      if (isStartDate) {
        rangeStyle = styles.rangeDayStart;
      } else if (isEndDate) {
        rangeStyle = styles.rangeDayEnd;
      } else if (isFirstInRow) {
        rangeStyle = styles.rangeDayLeft;
      } else if (isLastInRow) {
        rangeStyle = styles.rangeDayRight;
      } else {
        rangeStyle = styles.rangeDayMiddle;
      }
    }

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayButton,
          isStartDate && styles.startDate,
          isEndDate && styles.endDate,
          isInRange && !isSelected && rangeStyle,
          isToday && styles.today,
        ]}
        onPress={() => handleDatePress(date)}
      >
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.otherMonthDay,
            isStartDate && styles.startDateText,
            isEndDate && styles.endDateText,
            isInRange && !isSelected && styles.rangeDayText,
            isToday && styles.todayText,
          ]}
        >
          {format(date, 'd')}
        </Text>
      </TouchableOpacity>
    );
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>기간 선택</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 월 네비게이션 */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
              style={styles.navButton}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {format(currentMonth, 'yyyy년 MM월', { locale: ko })}
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
              style={styles.navButton}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* 요일 헤더 */}
          <View style={styles.weekHeader}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekDayHeader}>
                <Text style={[
                  styles.weekDayText,
                  index === 0 && styles.sundayText,
                  index === 6 && styles.saturdayText,
                ]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* 캘린더 그리드 */}
          <View style={styles.calendarGrid}>
            {Array.from({ length: Math.ceil(days.length / 7) }, (_, rowIndex) => (
              <View key={rowIndex} style={styles.calendarRow}>
                {days.slice(rowIndex * 7, (rowIndex + 1) * 7).map((date, colIndex) => 
                  renderDay(date, rowIndex * 7 + colIndex)
                )}
              </View>
            ))}
          </View>

          {/* 선택된 기간 표시 */}
          <View style={styles.selectedRange}>
            <Text style={styles.selectedRangeText}>
              {selectedStartDate && selectedEndDate
                ? `${format(selectedStartDate, 'MM/dd')} ~ ${format(selectedEndDate, 'MM/dd')}`
                : '기간을 선택해주세요'}
            </Text>
          </View>

          {/* 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CalendarPicker; 