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


export default function Filters() {

  const [teamOpen, setTeamOpen] = React.useState(true);
  const [assigneeOpen, setAssigneeOpen] = React.useState(true);
  const [skillOpen, setSkillOpen] = React.useState(true);

  return (
    // Todo: Enclose this with a check for Admin soon
    <div className='filters'>
      <List disablePadding>
        <ListItemButton onClick={() => setTeamOpen(!teamOpen)}>
          <ListItemText primary="Assigned To" />
          {teamOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={teamOpen} timeout="auto">
          <List component="div" disablePadding>
            {/* Placeholder only, replace with the actual members in the database */}
            {['Team Member 1', 'Team Member 2', 'Team Member 3'].map((member, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton sx={{ paddingLeft: 4, paddingTop: 0, paddingBottom: 0, minHeight: 'auto' }}>
                  <FormControlLabel
                    control={<Checkbox defaultChecked size="small"/>}
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
          <ListItemText primary="Assigned By" />
          {assigneeOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={assigneeOpen} timeout="auto">
          <List component="div" disablePadding>
            {/* Placeholder only, replace with the actual members in the database */}
            {['Admin 1', 'Admin 2', 'Admin 3'].map((admin, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton sx={{ paddingLeft: 4, paddingTop: 0, paddingBottom: 0, minHeight: 'auto' }}>
                  <FormControlLabel
                    control={<Checkbox defaultChecked size="small"/>}
                    label={admin}
                    sx={{ width: '100%' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
      
      <List disablePadding>
        <ListItemButton onClick={() => setSkillOpen(!skillOpen)}>
          <ListItemText primary="Skills" />
          {skillOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={skillOpen} timeout="auto">
          <List component="div" disablePadding>
            {/* Placeholder only, replace with the actual members in the database */}
            {['HTML', 'CSS', 'JS'].map((skill, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton sx={{ paddingLeft: 4, paddingTop: 0, paddingBottom: 0, minHeight: 'auto' }}>
                  <FormControlLabel
                    control={<Checkbox defaultChecked size="small"/>}
                    label={skill}
                    sx={{ width: '100%' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>

    </div>
  )
}
        
