import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';

const DateRangePicker = ({ startsDate, endsDate }) => {
  const { t } = useTranslation();
  // Initialize startDate and endDate to today's date if no date is selected
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (startDate && typeof startsDate === 'function') {
      startsDate(startDate);
    }
  }, [startDate, startsDate]);

  useEffect(() => {
    if (endDate && typeof endsDate === 'function') {
      endsDate(endDate);
    }
  }, [endDate, endsDate]);

  return (
    <div className="flex items-center">
      {/* Start Date Picker */}
      <div className="pl-2 flex items-center gap-2">
        <label className="text-sm font-semibold text-white whitespace-nowrap">
          {/* 시작 날짜 */}
          {t('DateRangePicker.StartDate')}:{' '}
        </label>
        <DatePicker
          className="border py-1 border-black text-center rounded-md w-32"
          selected={startDate}
          onSelect={(date) => setStartDate(date || new Date())} // Set to today if blank
          selectsStart
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      {/* Tilde Symbol */}
      <span className="pl-2 text-lg text-white font-bold">~</span>

      {/* End Date Picker */}
      <div className="pl-2 flex items-center gap-2">
        <label className="text-sm font-semibold text-white whitespace-nowrap">
          {/* 종료 날짜 */}
          {t('DateRangePicker.EndDate')}:{' '}
        </label>
        <DatePicker
          className="border border-black py-1 text-center rounded-md w-32"
          selected={endDate}
          onSelect={(date) => setEndDate(date || new Date())} // Set to today if blank
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
