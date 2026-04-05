import React, { useState, useEffect } from 'react'
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
  const [currentPage, setCurrentPage] = useState('signin'); // 'Calendar' as default page
  const [openCreateTaskSignal, setOpenCreateTaskSignal] = useState(false);

  // states for filters
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableAssignees, setAvailableAssignees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    teamMembers: [],
    assignees: [],
    skills: [] // Default skills
  });

  useEffect(() => {
    if (!user?.team_id) return;

    fetch('/tasks', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []));

    if (user.role === 'team_lead' || Number(user.role) === 0) {
      fetch(`/teams/${user.team_id}/members`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => Array.isArray(data) && setTeamMembers(data)); // Keep full objects
    } else {
      fetch(`/teams/${user.team_id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.team_leads) setAvailableAssignees(data.team_leads);
        });
    }
  }, [user]);

  const handleFilterChange = (category, newValues) => {
    setSelectedFilters(prev => ({ ...prev, [category]: newValues }));
  };

  const handleRequestOpenCreateTask = () => {
    setOpenCreateTaskSignal(true);
    setCurrentPage('taskCalendar');
  };

  // Only logged in users can view
  const protectedPages = {
    // calendar: <Calendar 
    //             tasks={tasks}
    //             openCreateTaskSignal={openCreateTaskSignal} 
    //             setOpenCreateTaskSignal={setOpenCreateTaskSignal} 
    //             selectedFilters={selectedFilters} 
    //           />,
    taskCalendar: <CalendarForTasks />,
    validateTasks: <ValidateTasks />,
    settings: <Settings user={user} setUser={setUser} setAuth={setAuth} />
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('teamflowCurrentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setAuth(true);
      setCurrentPage('taskCalendar');
    } else {
      setAuth(false);
      setCurrentPage('signin');
    }
  }, []);

  
  // const pages = {
  //   calendar: <Calendar openCreateTaskSignal={openCreateTaskSignal} setOpenCreateTaskSignal={setOpenCreateTaskSignal} />,
  //   taskCalendar: <CalendarForTasks />,
  //   validateTasks: <ValidateTasks />,
  //   settings: <Settings />,
  //   //For my testing only
  //   signin: <SignIn onNavigate= {setCurrentPage} onSignedIn={(userData) => {setAuth(true); setUser(userData)}} />,
  //   signup: <SignUp onNavigate= {setCurrentPage}/>
  // };

  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <ThemeProvider theme={theme}>
        {auth ? (
          <Drawer auth= {auth} setAuth= {setAuth} user = {user} setUser = {setUser} onNavigate= {setCurrentPage} 
          onRequestOpenCreateTask={handleRequestOpenCreateTask}
          tasks={tasks}
          teamMembers={teamMembers}
          availableAssignees={availableAssignees}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
        >
            {protectedPages[currentPage]}
          </Drawer>
        ) : (
          currentPage === "signup" ? (
            <SignUp onNavigate={setCurrentPage} />
          ) : (
            <SignIn onNavigate= {setCurrentPage} onSignedIn={(userData) => {setAuth(true); setUser(userData); setCurrentPage('calendar')}} />
          )
        )
          
        }
        {/*
        <div>
          {pages[currentPage]}
        </div>
          */}
        
      </ThemeProvider>
    </SnackbarProvider>
  )
}