import React, { useRef, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';
import CreateTask from './CreateTask';

export default function Calendar({openCreateTaskSignal, setOpenCreateTaskSignal}) {
  const calendarRef = useRef(null);
  const containerRef = useRef(null);

  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [clickedTime, setClickedTime] = useState(dayjs().format('YYYY-MM-DD HH:mm'));
  
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
  
  const handleCreateTaskOpen = () => {
    setOpenCreateTask(true);
  };
  
  const handleCreateTaskClose = () => {
    setOpenCreateTask(false);
    setOpenCreateTaskSignal(false);
  };

  const handleDateClick = (arg) => {
    if(dayjs(arg.dateStr).isBefore(dayjs())) return;

    setClickedTime(dayjs(arg.dateStr).format('YYYY-MM-DD HH:mm'));
    handleCreateTaskOpen();
  };

  useEffect(() => {
    if(openCreateTaskSignal){
      setOpenCreateTask(true);
    }
  },[openCreateTaskSignal]);
  

  return (
    <div className="calendar" ref={containerRef}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        dateClick={handleDateClick}
        height="calc(100vh - 128px)"

        //for testing only
        events={[
          { title: 'event 1', start: '2026-03-17', end:'2026-03-19' },
          { title: 'event 2', start:'2026-03-20T11:30', end:'2026-03-20T14:00' }
          ]}
      />
      <CreateTask open={openCreateTask} onClose={handleCreateTaskClose} clickedTime={clickedTime} />
    </div>
  );
}