import React, { useRef, useEffect, useState } from "react";
import dayjs from "dayjs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useSnackbar } from "notistack";
import "./Calendar.css";
import CreateTask from "./CreateTask";
import TaskDetail from "./TaskDetail";  

export default function Calendar({
  openCreateTaskSignal,
  setOpenCreateTaskSignal,
}) {
  const calendarRef = useRef(null);
  const containerRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [clickedTime, setClickedTime] = useState(null);

  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [clickedEvent, setClickedEvent] = useState(null);
  
  const [anchorEl, setAnchorEl] = useState(null);
  
  //testing only, should come from the database
  const events = [
    { title: "event 1", start: "2026-03-17", end: "2026-03-19" },
    { title: "event 2", start: "2026-03-20T11:30", end: "2026-03-20T14:00" },
  ];
  const previewEvent = clickedTime ? {
    title: "(No title)",
    start: clickedTime,
    end: dayjs(clickedTime).add(1, "hour").format("YYYY-MM-DDTHH:mm"),
  }: null;

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

  const handleCreateTaskClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setOpenCreateTask(false);
    setOpenCreateTaskSignal(false);
    setAnchorEl(null);
    setClickedTime(null);
  };

  const handleTaskDetailClose = () => {
    setOpenTaskDetail(false);
    setAnchorEl(null);
    setClickedEvent(null);
  }

  const handleDateClick = (arg) => {
    if (dayjs(arg.dateStr).isBefore(dayjs())) {
      enqueueSnackbar("Please select a future time slot to create your task");
      return;
    }

    setClickedTime(dayjs(arg.dateStr).format("YYYY-MM-DDTHH:mm"));
    setAnchorEl(
      arg.jsEvent?.currentTarget || arg.dayEl || arg.jsEvent?.target || null,
    );
    setOpenCreateTask(true);
  };

  const handleEventClick = (arg) => {
    setAnchorEl(arg.el || arg.jsEvent?.currentTarget || arg.jsEvent?.target || null);
    setClickedEvent(arg.event);
    setOpenTaskDetail(true);
  };

  useEffect(() => {
    if (openCreateTaskSignal) {
      setOpenCreateTask(true);
    }
  }, [openCreateTaskSignal]);

  return (
    <div className="calendar" ref={containerRef}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="calc(100vh - 128px)"
        events={previewEvent ? [...events, previewEvent] : events}
      />
      <CreateTask
        open={openCreateTask}
        onClose={handleCreateTaskClose}
        anchorEl={anchorEl}
        clickedTime={clickedTime}
      />
      <TaskDetail
        open={openTaskDetail}
        onClose={handleTaskDetailClose}
        anchorEl={anchorEl}
        clickedEvent={clickedEvent}
      />
    </div>
  );
}
