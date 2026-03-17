import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Calendar() {
  const calendarRef = useRef(null);
  const containerRef = useRef(null);

  
  useEffect(() => {
    if (!calendarRef.current || !containerRef.current) return;

    const calendarApi = calendarRef.current.getApi();

    // MDN docs: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver

    const resizeObserver = new ResizeObserver(() => {
      calendarApi.updateSize();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };

  }, []); // Dependency array is empty because it is guaranteed to run at least once during mounting of component

  const handleDateClick = (arg) => {
    alert(arg.dateStr);
  };

  return (
    <div className="calendar" ref={containerRef}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        dateClick={handleDateClick}
        height="calc(100vh - 128px)"
      />
    </div>
  );
}