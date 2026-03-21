import * as React from "react";
import dayjs from "dayjs";
import {
  Button,
  Switch,
  Slider,
  TextField,
  Autocomplete,
  Popover,
  Box,
  Backdrop,
  CircularProgress,
  FormControlLabel,
} from "@mui/material";
import { SnackbarProvider, useSnackbar } from "notistack";
import axios from "axios";

export default function CreateTask({ open, onClose, anchorEl, clickedTime }) {
  // Mock data only, these should come from the database
  const teamMembers = [
    { id: 1, name: "Team Member 1" },
    { id: 2, name: "Team Member 2" },
    { id: 3, name: "Team Member 3" },
  ];

  const [assignee, setAssignee] = React.useState(null);
  const [allDay, setAllDay] = React.useState(false);
  const [title, setTitle] = React.useState("(No title)");
  const [description, setDescription] = React.useState("");
  const [point, setPoint] = React.useState(3);

  const [startDate, setStartDate] = React.useState(
    dayjs().format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = React.useState(
    dayjs().add(1, "hour").format("YYYY-MM-DD"),
  );
  const [startTime, setStartTime] = React.useState(dayjs().format("HH:mm"));
  const [endTime, setEndTime] = React.useState(
    dayjs().add(1, "hour").format("HH:mm"),
  );

  const [dateError, setDateError] = React.useState(false);
  const [timeError, setTimeError] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [hold, setHold] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (!clickedTime) {
        setStartDate(dayjs().format("YYYY-MM-DD"));
        setEndDate(dayjs().add(1, "hour").format("YYYY-MM-DD"));
        setStartTime(dayjs().format("HH:mm"));
        setEndTime(dayjs().add(1, "hour").format("HH:mm"));
      } else {
        setStartDate(dayjs(clickedTime).format("YYYY-MM-DD"));
        setEndDate(dayjs(clickedTime).add(1, "hour").format("YYYY-MM-DD"));
        setStartTime(dayjs(clickedTime).format("HH:mm"));
        setEndTime(dayjs(clickedTime).add(1, "hour").format("HH:mm"));
      }

      setTitle("");
      setDescription("");
      setAssignee(null);
      setAllDay(false);
      setPoint(3);
      setDateError(false);
      setTimeError(false);
    }
  }, [clickedTime, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const startDateTime = dayjs(
      `${startDate} ${startTime}`,
      "YYYY-MM-DD HH:mm",
    );
    const endDateTime = dayjs(`${endDate} ${endTime}`, "YYYY-MM-DD HH:mm");

    if (dayjs(startDate).isBefore(dayjs(), "day")) {
      enqueueSnackbar("Tasks must be scheduled for a future time");
      setDateError(true);
      return;
    }

    if (dayjs(endDate).isBefore(dayjs(startDate))) {
      enqueueSnackbar("The end date should be after the start date");
      setDateError(true);
      return;
    }
    setDateError(false);
    
    if (!allDay && !endDateTime.isAfter(startDateTime)) {
      enqueueSnackbar("The end time should be after the start time");
      setTimeError(true);
      return;
    }
    setTimeError(false);
    /*
    const newTask = {
      title: title.trim(),
      description: description.trim(),
      team_id: assignee,
      start_time: startDateTime.format('YYYY-MM-DDTHH:mm:ss'),
      end_time: endDateTime.format('YYYY-MM-DDTHH:mm:ss'),
    };
      
    //testing only, should go to the database
    console.log('Create task:', newTask);
*/

    const newTask = {
      description: title.trim(),
      due_date: endDate,
      user_id: 1,
      points: point,
    };

    enqueueSnackbar("Creating task...");
    //console.log('sending task:', newTask);
    setHold(true);

    try {
      const r = await axios.post("/tasks", newTask, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("status:", r.status);
      console.log("data:", r.data);

      onClose();
      enqueueSnackbar("Task created!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Something went wrong.", { variant: "error" });
      console.error("axios error:", error);
    }
    setHold(false);
  };

  return (
    <Popover
      disableRestoreFocus
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "center",
        horizontal:
          clickedTime === null || dayjs(clickedTime).day() <= 2
            ? "right"
            : "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal:
          clickedTime === null || dayjs(clickedTime).day() <= 2
            ? "left"
            : "right",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          width: 420,
          maxWidth: "90vw",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <TextField
          label="Task Title"
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          autoFocus
          variant="standard"
        />

        <TextField
          fullWidth
          margin="dense"
          multiline
          minRows={3}
          label="Description"
          onChange={(e) => setDescription(e.target.value)}
          variant="filled"
        />

        <Autocomplete
          options={teamMembers}
          getOptionLabel={(option) => option.name || ""}
          value={teamMembers.find((m) => m.id === assignee) || null}
          onChange={(e, newValue) => setAssignee(newValue ? newValue.id : null)}
          renderInput={(p) => (
            <TextField {...p} label="Assign To" variant="standard" />
          )}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            required
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="standard"
            sx={{ flex: 1 }}
            error={dateError}
            helperText={dateError ? "Invalid Date" : ""}
          />
          <TextField
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="standard"
            sx={{ flex: 1 }}
            disabled={allDay}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            required
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="standard"
            sx={{ flex: 1 }}
            error={dateError}
            helperText={dateError ? "Invalid Date" : ""}
          />
          <TextField
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="standard"
            sx={{ flex: 1 }}
            disabled={allDay}
            error={timeError}
            helperText={timeError ? "Invalid End Time" : ""}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControlLabel
            sx={{ flex: 1, justifyContent: "center" }}
            control={
              <Switch
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
            }
            label="all-day"
          />
          <Box sx={{ flex: 2 }}>
            <label style={{ color: "rgba(0,0,0,0.6)", fontSize: "12px" }}>
              Point
            </label>
            <Slider
              value={point}
              onChange={(e, newValue) => setPoint(newValue)}
              valueLabelDisplay="auto"
              step={1}
              shiftStep={3}
              min={1}
              max={10}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Create
          </Button>
        </Box>
      </Box>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={hold}
        autohideduration={3000}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Popover>
  );
}
