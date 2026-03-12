import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Calendar from './components/Calendar';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import SignIn from './components/SignIn'
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('calendar'); // 'Calendar' as default page

  const pages = {
    calendar: <Calendar />,
    settings: <Settings />,
    signin: <SignIn />,
  };

  return (
    <div>
      <header>
        <Header onNavigate={setCurrentPage}/>
      </header>
      <div className="content">
          <Sidebar onNavigate={setCurrentPage}/>
            {pages[currentPage]}
      </div>
    </div>
  )
}