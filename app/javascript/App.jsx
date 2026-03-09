import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Calendar from './components/Calendar';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('calendar'); // 'Calendar' as default page
  return (
    <div>
      <header>
        <Header onNavigate={setCurrentPage}/>
      </header>
      <div className="content">
          <Sidebar onNavigate={setCurrentPage}/>
          {currentPage === 'calendar' ? <Calendar /> : <Settings />}
      </div>
    </div>
  )
}