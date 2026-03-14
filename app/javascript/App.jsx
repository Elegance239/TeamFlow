import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import SignIn from './components/SignIn'
import Drawer from './components/Drawer';
import './App.css';

export default function App() {
  const [auth, setAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState('calendar'); // 'Calendar' as default page

  const pages = {
    calendar: <Calendar />,
    settings: <Settings />,
    signin: <SignIn />,
  };

  return (
    <div>
      <Drawer auth= {auth} setAuth= {setAuth} onNavigate= {setCurrentPage}/>
      <div className="content">
            {pages[currentPage]}
      </div>
    </div>
  )
}
