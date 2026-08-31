import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './DatePicker.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Custom Date & Month Picker Component
 * Supports mode="date" (YYYY-MM-DD) and mode="month" (YYYY-MM)
 */
export default function DatePicker({
  value = '',
  onChange,
  mode = 'date', // 'date' | 'month'
  minDate = '',
  maxDate = '',
  placeholder = 'Select date',
  disabled = false,
  required = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial date or default to current date
  const parseDate = (val) => {
    if (!val) return new Date();
    if (mode === 'month') {
      const [y, m] = val.split('-');
      return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    }
    const [y, m, d] = val.split('-');
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  };

  const initialDate = parseDate(value);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewMode, setViewMode] = useState(mode === 'month' ? 'month' : 'days'); // 'days' | 'months' | 'years'

  // Update view when value changes externally
  useEffect(() => {
    if (value) {
      const parsed = parseDate(value);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setViewMode(mode === 'month' ? 'month' : 'days');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, mode]);

  // Format value for display
  const formatDisplayValue = () => {
    if (!value) return '';
    if (mode === 'month') {
      const [y, m] = value.split('-');
      const monthIdx = parseInt(m, 10) - 1;
      return `${MONTH_NAMES[monthIdx]} ${y}`;
    }
    const [y, m, d] = value.split('-');
    const monthIdx = parseInt(m, 10) - 1;
    return `${parseInt(d, 10)} ${MONTH_SHORT_NAMES[monthIdx]} ${y}`;
  };

  const isDateDisabled = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isMonthDisabled = (year, month) => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    if (minDate && monthStr < minDate.slice(0, 7)) return true;
    if (maxDate && monthStr > maxDate.slice(0, 7)) return true;
    return false;
  };

  const handleSelectDay = (day) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectMonth = (monthIdx) => {
    if (mode === 'month') {
      const formatted = `${viewYear}-${String(monthIdx + 1).padStart(2, '0')}`;
      onChange(formatted);
      setIsOpen(false);
    } else {
      setViewMonth(monthIdx);
      setViewMode('days');
    }
  };

  const handleSelectYear = (year) => {
    setViewYear(year);
    if (mode === 'month') {
      setViewMode('month');
    } else {
      setViewMode('days');
    }
  };

  const handlePrev = () => {
    if (viewMode === 'years') {
      setViewYear((prev) => prev - 12);
    } else if (viewMode === 'month' || mode === 'month') {
      setViewYear((prev) => prev - 1);
    } else {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((prev) => prev - 1);
      } else {
        setViewMonth((prev) => prev - 1);
      }
    }
  };

  const handleNext = () => {
    if (viewMode === 'years') {
      setViewYear((prev) => prev + 12);
    } else if (viewMode === 'month' || mode === 'month') {
      setViewYear((prev) => prev + 1);
    } else {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((prev) => prev + 1);
      } else {
        setViewMonth((prev) => prev + 1);
      }
    }
  };

  const handleToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    if (mode === 'month') {
      onChange(`${y}-${m}`);
    } else {
      onChange(`${y}-${m}-${d}`);
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = [];
  // Previous month filler days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: viewMonth - 1,
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      month: viewMonth,
      isCurrentMonth: true,
    });
  }
  // Next month filler days
  const remainingSlots = 42 - calendarDays.length; // 6 rows of 7
  for (let i = 1; i <= remainingSlots; i++) {
    calendarDays.push({
      day: i,
      month: viewMonth + 1,
      isCurrentMonth: false,
    });
  }

  // Years range for year picker
  const startYear = Math.floor(viewYear / 12) * 12;
  const yearsList = Array.from({ length: 12 }, (_, i) => startYear + i);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className={`custom-datepicker-container ${className}`} ref={containerRef}>
      <div
        className={`custom-datepicker-input ${disabled ? 'disabled' : ''} ${isOpen ? 'active' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
      >
        <CalendarIcon size={16} className="datepicker-icon" />
        <span className={`datepicker-text ${!value ? 'placeholder' : ''}`}>
          {formatDisplayValue() || placeholder}
        </span>
        {value && !disabled && (
          <button
            type="button"
            className="datepicker-clear-btn"
            onClick={handleClear}
            title="Clear date"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="custom-datepicker-dropdown">
          {/* Header */}
          <div className="datepicker-header">
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={handlePrev}
              aria-label="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="datepicker-title-group">
              {mode !== 'month' && viewMode === 'days' && (
                <button
                  type="button"
                  className="datepicker-header-title"
                  onClick={() => setViewMode('month')}
                >
                  {MONTH_NAMES[viewMonth]}
                </button>
              )}
              <button
                type="button"
                className="datepicker-header-title"
                onClick={() => setViewMode(viewMode === 'years' ? (mode === 'month' ? 'month' : 'days') : 'years')}
              >
                {viewMode === 'years' ? `${startYear} - ${startYear + 11}` : viewYear}
              </button>
            </div>
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={handleNext}
              aria-label="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days View */}
          {viewMode === 'days' && (
            <div className="datepicker-body">
              <div className="datepicker-weekdays">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="datepicker-weekday">
                    {d}
                  </div>
                ))}
              </div>
              <div className="datepicker-days-grid">
                {calendarDays.map((item, idx) => {
                  const dayYear = item.month < 0 ? viewYear - 1 : item.month > 11 ? viewYear + 1 : viewYear;
                  const dayMonth = (item.month + 12) % 12;
                  const itemDateStr = `${dayYear}-${String(dayMonth + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
                  const isSelected = value === itemDateStr;
                  const isToday = todayStr === itemDateStr;
                  const isDisabled = !item.isCurrentMonth || isDateDisabled(dayYear, dayMonth, item.day);

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isDisabled}
                      className={`datepicker-day-btn ${!item.isCurrentMonth ? 'outside-month' : ''} ${
                        isSelected ? 'selected' : ''
                      } ${isToday ? 'today' : ''}`}
                      onClick={() => item.isCurrentMonth && handleSelectDay(item.day)}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month Selection Grid */}
          {viewMode === 'month' && (
            <div className="datepicker-grid-selector">
              {MONTH_SHORT_NAMES.map((mName, mIdx) => {
                const isSelected =
                  mode === 'month'
                    ? value === `${viewYear}-${String(mIdx + 1).padStart(2, '0')}`
                    : viewMonth === mIdx;
                const isDisabled = isMonthDisabled(viewYear, mIdx);

                return (
                  <button
                    key={mName}
                    type="button"
                    disabled={isDisabled}
                    className={`datepicker-grid-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectMonth(mIdx)}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          )}

          {/* Year Selection Grid */}
          {viewMode === 'years' && (
            <div className="datepicker-grid-selector">
              {yearsList.map((y) => {
                const isSelected = viewYear === y;
                return (
                  <button
                    key={y}
                    type="button"
                    className={`datepicker-grid-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectYear(y)}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="datepicker-footer">
            <button type="button" className="datepicker-footer-btn" onClick={handleToday}>
              {mode === 'month' ? 'This Month' : 'Today'}
            </button>
            <button
              type="button"
              className="datepicker-footer-btn datepicker-footer-close"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

