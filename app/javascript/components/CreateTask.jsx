import * as React from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import FormControlLabel from '@mui/material/FormControlLabel';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function CreateTask({open, onClose, clickedTime}) {
  // Mock data only, these should come from the database
  const teamMembers = [
    { id: 1, name: "Team Member 1" },
    { id: 2, name: "Team Member 2" },
    { id: 3, name: "Team Member 3" },
  ];

  const [assignee, setAssignee] = React.useState(teamMembers[0].id);
  const [allDay, setAllDay] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [point, setPoint] = React.useState(1);

  const [startDate, setStartDate] = React.useState(dayjs(clickedTime).format('YYYY-MM-DD'));
  const [endDate, setEndDate] = React.useState(dayjs(clickedTime).format('YYYY-MM-DD'));
  const [startTime, setStartTime] = React.useState(dayjs(clickedTime).format('HH:mm'));
  const [endTime, setEndTime] = React.useState(dayjs(clickedTime).add(1, 'hour').format('HH:mm'));

  const [dateError, setDateError] = React.useState(false);
  const [timeError, setTimeError] = React.useState(false);

  React.useEffect(() => {
  if (open) {
    setTitle('');
    setDescription('');
    setAssignee(teamMembers[0].id);
    setStartDate(dayjs(clickedTime).format('YYYY-MM-DD'));
    setEndDate(dayjs(clickedTime).format('YYYY-MM-DD'));
    setStartTime(dayjs(clickedTime).format('HH:mm'));
    setEndTime(dayjs(clickedTime).add(1, 'hour').format('HH:mm'));
    setAllDay(false);
    setPoint(1);
    setDateError(false);
    setTimeError(false);
  }
}, [clickedTime, open]);


  const handleSubmit = async (event) => {
    event.preventDefault();

    const startDateTime = dayjs(`${startDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
    const endDateTime = dayjs(`${endDate} ${endTime}`, 'YYYY-MM-DD HH:mm');
    
    if (dayjs(startDate).isBefore(dayjs(), 'day') || dayjs(endDate).isBefore(dayjs(startDate))){
      setDateError(true);
      return
    }

    if (!allDay && !endDateTime.isAfter(startDateTime)) {
      setTimeError(true);
      return;
    }

    const newTask = {
      title: title.trim(),
      description: description.trim(),
      team_id: assignee,
      start_time: startDateTime.format('YYYY-MM-DDTHH:mm:ss'),
      end_time: endDateTime.format('YYYY-MM-DDTHH:mm:ss'),
      };
      
      //testing only, should go to the database
      console.log('Create task:', newTask);
    
    onClose();
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Create Task</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} id="subscription-form">
            <div style={{ width: '100%', display: 'flex', gap: '16px'}}>
            <TextField
              style={{ flex: 7 }}
              autoFocus
              required
              margin="dense"
              id="title"
              name="title"
              label="Task Title"
              type="title"
              variant="standard"
              onChange={(e) => {setTitle(e.target.value)}}
              />
            <TextField
              style={{ flex: 2 }}
              required
              select
              margin="dense"
              label="Point"
              value={point}
              onChange={(e) => setPoint(e.target.value)}
              variant="standard"
            >
            {[1,2,3,4,5,6,7,8,9,10].map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
            </TextField>
            </div>

            <TextField
              multiline
              fullWidth
              minRows={4}
              maxRows={4}
              margin="normal"
              id="description"
              name="description"
              label="Task Description"
              type="description"
              onChange={(e) => {setDescription(e.target.value)}}
            />
            <TextField
              select
              margin="dense"
              fullWidth
              label="Assign To"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              variant="standard"
            >
            {teamMembers.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.name}
              </MenuItem>
            ))}
            </TextField>
            <div style={{ width: '100%', display: 'flex', gap: '20px'}}>
            <TextField
              required
              error={dateError}
              helperText={dateError ? "Invalid Date" : ""}
              style={{ flex: 1 }}
              margin="dense"
              label="Start Date"
              type="date"
              name="startDate"
              onChange={(e) => setStartDate(e.target.value)}
              value={startDate}
              InputLabelProps={{ shrink: true }}
              variant="standard"
              />
            <TextField
              disabled={allDay}
              style={{ flex: 1 }}
              margin="dense"
              label="Start Time"
              type="time"
              name="startTime"
              onChange={(e) => setStartTime(e.target.value)}
              value={startTime}
              InputLabelProps={{ shrink: true }}
              variant="standard"
              />
            </div>
            <div style={{ width: '100%', display: 'flex', gap: '20px'}}>
            <TextField
              required
              error={dateError}
              helperText={dateError ? "Invalid Date" : ""}
              style={{ flex: 1 }}
              margin="dense"
              label="End Date"
              type="date"
              name="endDate"
              onChange={(e) => setEndDate(e.target.value)}
              value={endDate}
              InputLabelProps={{ shrink: true }}
              variant="standard"
              />
            <TextField
              disabled={allDay}
              error={timeError}
              helperText={timeError ? "Invalid End Time" : ""}
              style={{ flex: 1 }}
              margin="dense"
              label="End Time"
              type="time"
              name="endTime"
              onChange={(e) => setEndTime(e.target.value)}
              value={endTime}
              InputLabelProps={{ shrink: true }}
              variant="standard"
              />
            </div>

            <FormControlLabel
              control={
                <Switch checked={allDay} onChange={(e) => setAllDay(e.target.checked)}/>
              }
              label="all-day"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="subscription-form">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
