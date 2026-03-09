import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Calendar from './components/Calendar';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './App.css';

export default function App() {
  return (
    <div>
      <header>
        <Header />
      </header>
      <div class = "content">
          <Sidebar />
          <Calendar />
      </div>
      
    </div>
  )
}