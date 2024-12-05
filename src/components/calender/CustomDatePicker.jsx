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

  const CustomButton = React.forwardRef(({ value, onClick }, ref) => (
    <button
      className="border py-1 px-4 bg-white text-black rounded-md cursor-default"
      onClick={onClick}
      ref={ref}
    >
      {value || 'Select Date'}
    </button>
  ));

  return (
    <div className="flex items-center">
      {/* 시작 날짜 선택기 */}
      <div className="flex items-center gap-0">
      <label className="text-sm font-semibold text-white whitespace-nowrap">
          {/* 다국어 레이블 */}
        </label>
        <DatePicker
          selected={startDate} // 선택된 시작 날짜
          onChange={(date) => startsDate(date || new Date())} // 날짜 선택 시 부모로 전달
          selectsStart
          startDate={startDate}
          endDate={endDate}
          maxDate={endDate} // 종료 날짜를 초과하지 않도록 설정
          locale={currentLocale} // 동적으로 설정된 로케일
          customInput={<CustomButton />} // 커스텀 버튼 추가
        />
      </div>

      <span className="pl-2 text-lg text-white font-bold">~</span>

      {/* 종료 날짜 선택기 */}
      <div className="pl-2 flex items-center gap-0">
      <label className="text-sm font-semibold text-white whitespace-nowrap">
          {/* 다국어 레이블 */}
        </label>
        <DatePicker
          selected={endDate} // 선택된 종료 날짜
          onChange={(date) => endsDate(date || new Date())}  // 날짜 선택 시 부모로 전달
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          maxDate={new Date()} // 오늘 날짜를 초과하지 않도록 설정
          locale={currentLocale} // 동적으로 설정된 로케일
          customInput={<CustomButton />} // 커스텀 버튼 추가
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
