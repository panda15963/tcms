import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';

const DateRangePicker = ({ startsDate, endsDate, startDate, endDate }) => {
  const { t } = useTranslation();

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
          {t('DateRangePicker.StartDate')}:{' '}
        </label>
        <DatePicker
          className="border py-1 border-black text-center rounded-md w-32"
          selected={startDate}
          onChange={(date) => startsDate(date || new Date())}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          maxDate={endDate} // Prevent selection beyond endDate
        />
      </div>

      {/* Tilde Symbol */}
      <span className="pl-2 text-lg text-white font-bold">~</span>

      {/* End Date Picker */}
      <div className="pl-2 flex items-center gap-2">
        <label className="text-sm font-semibold text-white whitespace-nowrap">
          {t('DateRangePicker.EndDate')}:{' '}
        </label>
        <DatePicker
          className="border border-black py-1 text-center rounded-md w-32"
          selected={endDate}
          onChange={(date) => endsDate(date || new Date())}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          maxDate={new Date()} // Prevent selection beyond today
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
