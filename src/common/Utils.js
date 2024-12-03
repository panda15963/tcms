import { isEmpty } from 'lodash';

/**
 * 문자열 날짜를 포맷팅하여 반환
 * @param {string} dateString - 포맷팅할 날짜 문자열
 * @returns {string} 포맷된 날짜 문자열 (YYYY-MM-DD HH:mm:ss 형식)
 */
export function formatStringDate(dateString) {
  if (!dateString || isEmpty(dateString)) return ''; // 날짜 문자열이 없거나 비어있으면 빈 문자열 반환

  const options = {
    year: 'numeric', // 연도 표시
    month: '2-digit', // 두 자리 월 표시
    day: '2-digit', // 두 자리 일 표시
    hour: '2-digit', // 두 자리 시 표시
    minute: '2-digit', // 두 자리 분 표시
    second: '2-digit', // 두 자리 초 표시
    hour12: false, // 24시간 형식 사용
  };

  const date = new Date(dateString); // 날짜 문자열을 Date 객체로 변환
  return new Intl.DateTimeFormat('en-US', options) // Intl.DateTimeFormat으로 날짜 포맷팅
    .format(date)
    .replace(/(\d{2})\/(\d{2})\/(\d{4}),/, '$3-$1-$2'); // MM/DD/YYYY 형식을 YYYY-MM-DD로 변환
}