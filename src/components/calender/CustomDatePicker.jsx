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
    <div className="flex items-center gap-4">
      {/* Start Date Picker */}
      <div className="pl-2 flex items-center gap-2">
        <label className="text-sm font-semibold whitespace-nowrap">
          {/* 시작 날짜 */}
          {t('DateRangePicker.StartDate')} :{' '}
        </label>
        <div className="w-48">
          <DatePicker
            className="border py-1 border-black text-center rounded-md"
            selected={startDate}
            onSelect={(date) => setStartDate(date || new Date())} // Set to today if blank
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>

      {/* Tilde Symbol */}
      <span className="text-lg mx-2">~</span>

      {/* End Date Picker */}
      <div className="pl-2 flex items-center gap-2">
        <label className="text-sm font-semibold whitespace-nowrap">
          {/* 종료 날짜 */}
          {t('DateRangePicker.EndDate')} :{' '}
        </label>
        <div className="w-48">
          <DatePicker
            className="border border-black py-1 text-center rounded-md"
            selected={endDate}
            onSelect={(date) => setEndDate(date || new Date())} // Set to today if blank
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
