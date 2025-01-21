import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

/**
 * DateRangePicker 컴포넌트 - 시작 날짜와 종료 날짜를 선택할 수 있는 컴포넌트
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {function} props.startsDate - 선택된 시작 날짜를 처리하는 함수
 * @param {function} props.endsDate - 선택된 종료 날짜를 처리하는 함수
 * @param {Date} props.startDate - 시작 날짜 값
 * @param {Date} props.endDate - 종료 날짜 값
 * @returns {JSX.Element} 날짜 범위 선택 UI
 */
const DateRangePicker = ({ startsDate, endsDate, startDate, endDate }) => {
  const { i18n } = useTranslation();

  // 현재 언어에 따라 DatePicker의 locale 설정
  const currentLocale = i18n.language === 'kor' ? ko : enUS;

  /**
   * 시작 날짜가 변경될 때 부모 컴포넌트로 전달
   */
  useEffect(() => {
    if (startDate && typeof startsDate === 'function') {
      startsDate(startDate);
    }
  }, [startDate, startsDate]);

  /**
   * 종료 날짜가 변경될 때 부모 컴포넌트로 전달
   */
  useEffect(() => {
    if (endDate && typeof endsDate === 'function') {
      endsDate(endDate);
    }
  }, [endDate, endsDate]);

  const handleDateInput = (event, setDate) => {
    let value = event.target?.value
      ? event.target.value.replace(/\D/g, '')
      : ''; // undefined 방지 및 숫자만 유지

    if (value.length > 4) value = value.slice(0, 4) + '-' + value.slice(4);
    if (value.length > 7) value = value.slice(0, 7) + '-' + value.slice(7, 10);

    event.target.value = value; // 포맷 적용

    // 입력이 YYYY-MM-DD 형식이 되었을 때만 상태 업데이트
    if (value.length === 10) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setDate(date);
      } else {
        console.error('Invalid date:', value);
      }
    }
  };

  return (
    <div className="flex items-center">
      {/* 시작 날짜 선택기 */}
      <div className="flex items-center gap-2">
        <DatePicker
          selected={startDate} // 선택된 시작 날짜
          onChange={(date) => startsDate(date || new Date())} // 날짜 선택 시 부모로 전달
          onChangeRaw={(event) => handleDateInput(event, startsDate)} // 입력 시 자동 포맷 적용
          selectsStart
          startDate={startDate}
          endDate={endDate}
          maxDate={endDate} // 종료 날짜를 초과하지 않도록 설정
          locale={currentLocale} // 동적으로 설정된 로케일
          dateFormat="yyyy-MM-dd" // 날짜 포맷 설정
          className="border py-1 px-3 rounded-md text-black cursor-default"
          placeholderText="YYYY-MM-DD" // 입력 필드에 힌트 추가
        />
      </div>

      <span className="px-2 text-lg text-white font-bold">~</span>

      {/* 종료 날짜 선택기 */}
      <div className="flex items-center gap-2">
        <DatePicker
          selected={endDate} // 선택된 종료 날짜
          onChange={(date) => endsDate(date || new Date())} // 날짜 선택 시 부모로 전달
          onChangeRaw={(event) => handleDateInput(event, endsDate)} // 입력 시 자동 포맷 적용
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          maxDate={new Date()} // 오늘 날짜를 초과하지 않도록 설정
          locale={currentLocale} // 동적으로 설정된 로케일
          dateFormat="yyyy-MM-dd" // 날짜 포맷 설정
          className="border py-1 px-3 rounded-md text-black cursor-default"
          placeholderText="YYYY-MM-DD" // 입력 필드에 힌트 추가
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
