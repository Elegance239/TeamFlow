import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import Filters from './Filters';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    variants: [
      {
        props: ({ open }) => open,
        style: {
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: 0,
        },
      },
    ],
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1, 0, 2.5),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

export default function PersistentDrawerLeft( { auth, setAuth, onNavigate, onRequestOpenCreateTask, children, user, setUser, tasks, 
  teamMembers, availableAssignees, selectedFilters, onFilterChange}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [teamName, setTeamName] = useState('');
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleSettingsClick = () => {
    onNavigate('settings');
    handleClose();
  }

  const handleLogoutClick = async () => {
    try {
      await fetch('/users/sign_out', {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      // Local logout still proceeds if network call fails.
    }

    localStorage.removeItem('teamflowCurrentUser');
    window.location.href = '/';
  }

  useEffect(() => {
    if (user?.team_id) {
      fetch(`/teams/${user.team_id}`, {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setTeamName(data.name);
        })
        .catch((err) => console.error('Failed to fetch team name', err));
    } else {
      setTeamName('');
    }
  }, [user?.team_id]);

  const adminItems = [
    {
      text: "Create Task",
      icon: <AssignmentIcon />,
      onClick: onRequestOpenCreateTask,
    },
    {
      text: "Validate Tasks",
      icon: <CheckIcon />,
      onClick: () => {onNavigate('validateTasks')}
    }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100%'}}>
      <CssBaseline />
      <AppBar position="fixed" open={open} elevation={0}
      sx={{ 
        backgroundColor: (theme) => theme.palette.background.default, 
        color: (theme) => theme.palette.text.primary,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none', 
      }}
    >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                mr: 2,
              },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Link component="button" variant="h6" underline='none' color='inherit' sx={{ alignSelf: 'center' }} onClick={() => onNavigate('calendar')}>
            TeamFlow
          </Link>
          <Box sx={{ flexGrow: 1 }} />
            {auth && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="black"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleSettingsClick}>Settings</MenuItem>
                <MenuItem onClick={handleLogoutClick}>Log Out</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: (theme) => theme.palette.background.default,
            color: (theme) => theme.palette.text.primary,
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{teamName}</Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        {user?.role === "team_lead" && (
          <List>
          <div className='admin'>
            <h4 style={{ paddingLeft: '20px' }}>Admin Panel</h4>
            {adminItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={item.onClick}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text}/>
                </ListItemButton>
              </ListItem>
            ))}
          </div>
        </List>
        )}
        <Divider />
        <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { onNavigate('taskCalendar')}}>
          <ListItemText primary="Calendar" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
            <ListItemButton onClick={() => { onNavigate('settings')}}>
            <ListItemText primary="Settings" />
            </ListItemButton>
        </ListItem>
        </List>
        <Divider />

        <Filters user={user}
          tasks={tasks}
          teamMembers={teamMembers} 
          availableAssignees={availableAssignees}
          selectedFilters={selectedFilters}
          onFilterChange={onFilterChange}
        />
          
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <div className='content'>
          {children}
        </div>
      </Main>
    </Box>
  );
}
