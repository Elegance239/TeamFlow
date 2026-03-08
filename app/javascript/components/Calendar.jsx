import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function Calendar() {
  const handleDateClick = (arg) => {
    alert(arg.dateStr)
  }

  return (
    <FullCalendar
      plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
      initialView='timeGridWeek'
    />
  )
}