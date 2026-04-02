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


export default function Filters( { user, tasks, teamMembers, availableAssignees, selectedFilters, onFilterChange } ) {

  const [teamOpen, setTeamOpen] = React.useState(true);
  const [assigneeOpen, setAssigneeOpen] = React.useState(true);
  const [skillOpen, setSkillOpen] = React.useState(true);

  const isLead = user?.role === "team_lead" || Number(user?.role) === 0;
  const isMember = user?.role === "team_member" || Number(user?.role) === 1;

  const availableSkills = [...new Set(
  (tasks || []).flatMap(t =>
    t.required_skills ? t.required_skills.split(',').map(s => s.trim()).filter(Boolean) : []
  )
  )];

  const getNameById = (id, list) => {
    const found = list.find(m => m.id === id);
    return found ? found.name : `User ${id}`;
  };

  const assignedToNames = [...new Set(
    (tasks || [])
      .filter(t => t.created_by === user?.id) //&& t.user_id !== null
      .map(t => t.assignee_name || `User ${t.user_id}`) 
  )];

  const assignedByNames = [...new Set(
    (tasks || [])
      .filter(t => t.user_id === user?.id)
      .map(t => t.creator_name || `User ${t.created_by}`) 
  )];

  const handleToggle = (category, value) => {
    const current = selectedFilters[category] || [];
    const newFilters = current.includes(value)
      ? current.filter((i) => i !== value)
      : [...current, value];
    onFilterChange(category, newFilters);
  };

  const renderFilterList = (category, items) => (
    <List component="div" disablePadding>
      {items.map((item, index) => (
        <ListItem key={index} disablePadding>
          <ListItemButton sx={{ pl: 4, py: 0, minHeight: 'auto' }}>
            <FormControlLabel
              control={
                <Checkbox 
                  size="small"
                  checked={selectedFilters[category]?.includes(item)}
                  onChange={() => handleToggle(category, item)}
                />
              }
              label={item}
              sx={{ width: '100%' }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
  
  return (
    // Todo: Enclose this with a check for Admin soon
    <div className='filters'>
      {isLead && (
        <List disablePadding>
          <ListItemButton onClick={() => setTeamOpen(!teamOpen)}>
            <ListItemText primary="Assigned To" /> 
            {teamOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={teamOpen} timeout="auto">
          {/* Placeholder only, replace with the actual members in the database */}
            {renderFilterList('teamMembers', assignedToNames)}
          </Collapse>
        </List>
      )}

      {isMember && (
        <List disablePadding>
          <ListItemButton onClick={() => setAssigneeOpen(!assigneeOpen)}>
            <ListItemText primary="Assigned By" />
            {assigneeOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={assigneeOpen} timeout="auto">
          {/* Placeholder only, replace with the actual members in the database */}
            {renderFilterList('assignees', assignedByNames)}
          </Collapse>
        </List>
      )}
      
      {(isMember || isLead) && (
        <List disablePadding>
        <ListItemButton onClick={() => setSkillOpen(!skillOpen)}>
          <ListItemText primary="Skills" />
          {skillOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={skillOpen} timeout="auto">
        {/* Placeholder only, replace with the actual members in the database */}
          {renderFilterList('skills', availableSkills)}
        </Collapse>
      </List>
      )}
      

    </div>
  )
}
        
