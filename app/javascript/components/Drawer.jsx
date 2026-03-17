import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsIcon from '@mui/icons-material/Settings';
import LoginIcon from '@mui/icons-material/Login';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

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

export default function PersistentDrawerLeft( { onNavigate, children }) {
  const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [teamOpen, setTeamOpen] = React.useState(true);
  const [assigneeOpen, setAssigneeOpen] = React.useState(true);

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

  return (
    <Box sx={{ display: 'flex', height: '100%'}}>
      <CssBaseline />
      <AppBar position="fixed" open={open} color='#fff'>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                mr: 2,
                color: '#444746',
              },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#444746' }}>
            TeamFlow
          </Typography>
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
                <MenuItem onClick={handleClose}>Log Out</MenuItem>
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
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#444746' }}>Department</Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <div className='admin'>
            <h4 style={{ paddingLeft: '20px' }}>Admin Panel</h4>
            {['Create Task', 'Delete Task'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <AssignmentIcon /> : <DeleteIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
            ))}
          </div>
        </List>
        <Divider />
        <List>
        <ListItem disablePadding>
            <ListItemButton onClick={() => { onNavigate('calendar')}}>
            <ListItemText primary="Calendar" />
            </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
            <ListItemButton onClick={() => { onNavigate('settings')}}>
            <ListItemText primary="Settings" />
            </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
            <ListItemButton onClick={() => { onNavigate('signin')}}>
            <ListItemText primary="Sign In" />
            </ListItemButton>
        </ListItem>
        </List>
        <Divider />
        
        {/* Todo: Enclose this with a check for Admin soon */}
        <List disablePadding>
          <ListItemButton onClick={() => setTeamOpen(!teamOpen)}>
            <ListItemText primary="Team Members" />
            {teamOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={teamOpen} timeout="auto">
            <List component="div" disablePadding>
              {/* Placeholder only, replace with the actual members in the database */}
              {['Team Member 1', 'Team Member 2', 'Team Member 3'].map((member, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton sx={{ paddingLeft: 4, paddingTop: 0, paddingBottom: 0, minHeight:'auto'}}>
                    <FormControlLabel
                      control={<Checkbox defaultChecked/>}
                      label={member}
                      sx={{ width: '100%' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
        
        {/* Todo: Enclose this with a check for User soon */}
        <List disablePadding>
          <ListItemButton onClick={() => setAssigneeOpen(!assigneeOpen)}>
            <ListItemText primary="Admin" />
            {assigneeOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={assigneeOpen} timeout="auto">
            <List component="div" disablePadding>
              {/* Placeholder only, replace with the actual members in the database */}
              {['Admin 1', 'Admin 2', 'Admin 3'].map((admin, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton sx={{ paddingLeft: 4, paddingTop: 0, paddingBottom: 0, minHeight:'auto'}}>
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label={admin}
                      sx={{ width: '100%' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>

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
