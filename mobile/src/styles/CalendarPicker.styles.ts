import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width * 0.9;
const DAY_SIZE = (CALENDAR_WIDTH - 40) / 7;

export default StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: CALENDAR_WIDTH,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sundayText: {
    color: '#FF6B6B',
  },
  saturdayText: {
    color: '#4ECDC4',
  },
  calendarGrid: {
    marginBottom: 20,
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  dayButton: {
    flex: 1,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  otherMonthDay: {
    color: '#CCC',
  },
  selectedDay: {
    backgroundColor: '#8B5CF6',
    borderRadius: DAY_SIZE / 2,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rangeDay: {
    backgroundColor: '#E9D5FF',
  },
  rangeDayStart: {
    backgroundColor: '#E9D5FF',
    borderTopLeftRadius: DAY_SIZE / 2,
    borderBottomLeftRadius: DAY_SIZE / 2,
    marginRight: 0,
  },
  rangeDayEnd: {
    backgroundColor: '#E9D5FF',
    borderTopRightRadius: DAY_SIZE / 2,
    borderBottomRightRadius: DAY_SIZE / 2,
    marginLeft: 0,
  },
  rangeDayLeft: {
    backgroundColor: '#E9D5FF',
    borderTopLeftRadius: DAY_SIZE / 2,
    borderBottomLeftRadius: DAY_SIZE / 2,
    marginRight: 0,
  },
  rangeDayRight: {
    backgroundColor: '#E9D5FF',
    borderTopRightRadius: DAY_SIZE / 2,
    borderBottomRightRadius: DAY_SIZE / 2,
    marginLeft: 0,
  },
  rangeDayMiddle: {
    backgroundColor: '#E9D5FF',
    marginLeft: 0,
    marginRight: 0,
  },
  rangeDayText: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  startDate: {
    backgroundColor: '#8B5CF6',
    borderTopLeftRadius: DAY_SIZE / 2,
    borderBottomLeftRadius: DAY_SIZE / 2,
    marginRight: 0,
  },
  startDateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  endDate: {
    backgroundColor: '#8B5CF6',
    borderTopRightRadius: DAY_SIZE / 2,
    borderBottomRightRadius: DAY_SIZE / 2,
    marginLeft: 0,
  },
  endDateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  today: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: DAY_SIZE / 2,
  },
  todayText: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  selectedRange: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  selectedRangeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    marginRight: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    marginLeft: 10,
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
