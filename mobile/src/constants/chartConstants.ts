// Chart 관련 상수들
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 차트 크기 및 레이아웃
export const CHART_CONFIG = {
  // 기본 패딩
  CHART_PADDING: 32,
  CONTAINER_MARGIN: 16,
  
  // 차트 크기 계산
  DEFAULT_CHART_WIDTH: SCREEN_WIDTH - 32,
  DEFAULT_CHART_HEIGHT: Math.min(280, SCREEN_HEIGHT * 0.35),
  MIN_CHART_HEIGHT: 200,
  MAX_CHART_HEIGHT: 400,
  
  // 반응형 비율
  CHART_WIDTH_RATIO: 0.95, // 화면 너비의 95%
  CHART_HEIGHT_RATIO: 0.35, // 화면 높이의 35%
  
  // 카드 간격
  CARD_MARGIN: 12,
  CARD_PADDING: 20,
  CARD_BORDER_RADIUS: 16,
};

// 차트 색상 팔레트
export const CHART_COLORS = {
  PRIMARY: 'rgba(134, 65, 244, 1)', // 보라색 (#8641F4)
  PRIMARY_LIGHT: 'rgba(134, 65, 244, 0.7)',
  PRIMARY_GRADIENT: '#8B5CF6',
  
  DANGER: 'rgba(255, 99, 132, 1)', // 빨간색
  DANGER_LIGHT: 'rgba(255, 99, 132, 0.7)',
  
  WARNING: 'rgba(255, 205, 86, 1)', // 노란색
  WARNING_LIGHT: 'rgba(255, 205, 86, 0.7)',
  
  SUCCESS: 'rgba(75, 192, 192, 1)', // 초록색
  SUCCESS_LIGHT: 'rgba(75, 192, 192, 0.7)',
  
  // 중성 색상
  GRID_COLOR: 'rgba(0, 0, 0, 0.1)',
  BACKGROUND: '#FFFFFF',
  TEXT: '#374151',
  TEXT_LIGHT: '#9CA3AF',
  BORDER: '#E5E7EB',
};

// 차트 스타일 설정
export const CHART_STYLE_CONFIG = {
  strokeWidth: {
    primary: 3,
    secondary: 2,
    thin: 1,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
  },
  shadow: {
    color: '#000',
    offset: { width: 0, height: 2 },
    opacity: 0.1,
    radius: 8,
    elevation: 4,
  },
};

// 날짜 프리셋 설정
export const DATE_PRESETS = [
  { label: '7일', days: 7 },
  { label: '2주', days: 14 },
  { label: '1개월', days: 30 },
  { label: '3개월', days: 90 },
] as const;

// 차트 타입별 설정
export const CHART_TYPE_CONFIG = {
  line: {
    bezier: false,
    withDots: true,
    withShadow: false,
    withScrollableDot: false,
    withInnerLines: true,
    withOuterLines: true,
    withVerticalLines: false,
    withHorizontalLines: true,
  },
  bar: {
    showValuesOnTopOfBars: true,
    fromZero: true,
    segments: 5,
  },
} as const;

// 반응형 유틸리티 함수
export const getResponsiveChartSize = (
  customWidth?: number, 
  customHeight?: number
) => {
  const width = customWidth || CHART_CONFIG.DEFAULT_CHART_WIDTH;
  const height = customHeight || CHART_CONFIG.DEFAULT_CHART_HEIGHT;
  
  return {
    width: Math.max(200, Math.min(width, SCREEN_WIDTH - CHART_CONFIG.CHART_PADDING)),
    height: Math.max(CHART_CONFIG.MIN_CHART_HEIGHT, Math.min(height, CHART_CONFIG.MAX_CHART_HEIGHT)),
  };
};

// 차트 데이터 색상 매핑
export const getChartDatasetColors = (index: number) => {
  const colors = [
    CHART_COLORS.PRIMARY,
    CHART_COLORS.DANGER,
    CHART_COLORS.WARNING,
    CHART_COLORS.SUCCESS,
  ];
  
  return colors[index % colors.length];
};