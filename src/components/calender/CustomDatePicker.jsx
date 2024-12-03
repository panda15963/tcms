import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

  return (
    <div className="flex items-center">
      {/* 시작 날짜 선택기 */}
      <div className="flex items-center gap-0">
        <label className="text-sm font-semibold text-white whitespace-nowrap">
          {/* 시작 날짜 레이블 (다국어 지원 예정) */}
        </label>
        <DatePicker
          className="border py-1 border-black text-center rounded-md w-32 h-10"
          selected={startDate} // 선택된 시작 날짜
          onChange={(date) => startsDate(date || new Date())} // 날짜 선택 시 부모로 전달
          selectsStart
          startDate={startDate}
          endDate={endDate}
          maxDate={endDate} // 종료 날짜를 초과하지 않도록 설정
        />
      </div>

      {/* 물결표 (~) */}
      <span className="pl-2 text-lg text-white font-bold">~</span>

      {/* 종료 날짜 선택기 */}
      <div className="pl-2 flex items-center gap-0">
        <label className="text-sm font-semibold text-white whitespace-nowrap">
          {/* 종료 날짜 레이블 (다국어 지원 예정) */}
        </label>
        <DatePicker
          className="border border-black py-1 text-center rounded-md w-32 h-10"
          selected={endDate} // 선택된 종료 날짜
          onChange={(date) => endsDate(date || new Date())} // 날짜 선택 시 부모로 전달
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          maxDate={new Date()} // 오늘 날짜를 초과하지 않도록 설정
        />
      </div>
    </div>
  );
};
export default DateRangePicker;