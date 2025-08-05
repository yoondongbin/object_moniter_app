/**
 * 간단하고 실용적인 날짜 유틸리티
 */

/**
 * 날짜를 깔끔한 형식으로 변환
 * "2025-08-05T11:01:58" → "2025-08-05 11:01"
 */
export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    // ISO 형식의 T를 공백으로 변경하고 초 제거
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return dateString || '';
  }
};

/**
 * 간단한 한국어 날짜 형식
 * "2025-08-05T11:01:58" → "8월 5일"
 */
export const formatKoreanDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${month}월 ${day}일`;
  } catch {
    return dateString || '';
  }
};