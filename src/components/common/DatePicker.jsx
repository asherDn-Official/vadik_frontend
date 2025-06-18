import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';

function DatePicker({ label, onChange }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (onChange) onChange(date);
  };

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-gray-700">{label}</span>}
      <div className="relative">
        <ReactDatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          className="p-2 pl-10 border border-gray-300 rounded-md"
          dateFormat="dd MMM yyyy"
        />
        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
}

export default DatePicker;