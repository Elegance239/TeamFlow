import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Calendar from './components/Calendar';
import CalendarForTasks from './components/CalendarForTasks'
import ValidateTasks from './components/ValidateTasks';
import Settings from './components/Settings';
import SignIn from './components/SignIn'
import Drawer from './components/Drawer';
import SignUp from './components/SignUp';
import { SnackbarProvider } from 'notistack';
import  { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';


const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('teamflowCurrentUser');
    return stored ? JSON.parse(stored) : null;
  })
  const [auth, setAuth] = useState(() => Boolean(localStorage.getItem('teamflowCurrentUser')));
  const [currentPage, setCurrentPage] = useState('calendar'); // 'Calendar' as default page
  const [openCreateTaskSignal, setOpenCreateTaskSignal] = useState(false);

  const pages = {
    calendar: <Calendar openCreateTaskSignal={openCreateTaskSignal} setOpenCreateTaskSignal={setOpenCreateTaskSignal} />,
    taskCalendar: <CalendarForTasks />,
    validateTasks: <ValidateTasks />,
    settings: <Settings />,
    //For my testing only
    signin: <SignIn onNavigate= {setCurrentPage} onSignedIn={(userData) => {setAuth(true); setUser(userData)}} />,
    signup: <SignUp onNavigate= {setCurrentPage}/>
  };

  const handleRequestOpenCreateTask = () => {
    setOpenCreateTaskSignal(true);
    setCurrentPage("calendar");
  };

  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <ThemeProvider theme={theme}>
        {/* For my testing only. To return back to normal comment out the div below and restore the commented part*/}
        <div>
          <Drawer auth= {auth} setAuth= {setAuth} user = {user} setUser = {setUser} onNavigate= {setCurrentPage} 
          onRequestOpenCreateTask={handleRequestOpenCreateTask}>
            {pages[currentPage]}
          </Drawer>
        </div>
        {/*
        <div>
          {pages[currentPage]}
        </div>
          */}
        
      </ThemeProvider>
    </SnackbarProvider>
  )
}
