import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import SignIn from './components/SignIn'
import Drawer from './components/Drawer';
import SignUp from './components/SignUp';
import { SnackbarProvider, useSnackbar } from 'notistack';
import  { ThemeProvider, createTheme } from '@mui/material/styles';
// I think it is better to use React Routing soon.
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';


const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

export default function App() {
  const [auth, setAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState('calendar'); // 'Calendar' as default page
  const [openCreateTaskSignal, setOpenCreateTaskSignal] = useState(false);

  const pages = {
    calendar: <Calendar openCreateTaskSignal={openCreateTaskSignal} setOpenCreateTaskSignal={setOpenCreateTaskSignal} />,
    settings: <Settings />,
    //For my testing only
    signin: <SignIn onNavigate= {setCurrentPage}/>,
    signup: <SignUp onNavigate= {setCurrentPage}/>
  };

  const handleRequestOpenCreateTask = () => {
    setOpenCreateTaskSignal(true);
    setCurrentPage("calendar");
  };

  return (
    <SnackbarProvider maxSnack={3}>
      <ThemeProvider theme={theme}>
        {/* For my testing only. To return back to normal comment out the div below and restore the commented part*/}
        <div>
          <Drawer auth= {auth} setAuth= {setAuth} onNavigate= {setCurrentPage} 
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
