import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Chip,
  Fab,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";
import TaskDialog from "./TaskDialog";
import TaskCreationDialog from "./TaskCreationDialog";
import "./CalendarForTasks.css";

const COLORS = {
  mine: "#1e88e5",
  completedByMe: "#2e7d32",
  unassigned: "#9e9e9e",
  unassignedPast: "#d32f2f",
  takenByOthers: "#7b1fa2",
};

const COLOR_ORDER = [
  "mine",
  "completedByMe",
  "unassigned",
  "unassignedPast",
  "takenByOthers",
];

const COLOR_INDEX = COLOR_ORDER.reduce((acc, key, idx) => {
  acc[key] = idx;
  return acc;
}, {});

const mockUsers = [
  {
    id: 1,
    email: "lead@teamflow.dev",
    name: "Taylor Lead",
    role: 0,
    skills: "ruby,react,testing,devops",
    team_id: 1,
  },
  {
    id: 2,
    email: "member@teamflow.dev",
    name: "Riley Member",
    role: 1,
    skills: "ruby,react,testing",
    team_id: 1,
  },
];

const mockCurrentUser = mockUsers[1];

const mockTasks = [
  {
    id: 1001,
    all_states: "UNASSIGNED,ASSIGNED,DEVELOPMENT,TESTING,PRODUCTION,COMPLETED",
    completed_by_id: null,
    created_by: 1,
    current_state: "UNASSIGNED",
    description: "Build timeline rendering for profile page",
    due_date: "2026-03-24",
    needs_validation: false,
    points: 5,
    required_skills: "react",
    team_id: 1,
    user_id: null,
  },
  {
    id: 1002,
    all_states: "UNASSIGNED,ASSIGNED,COMPLETED",
    completed_by_id: 2,
    created_by: 1,
    current_state: "COMPLETED",
    description: "Fix flaky request spec",
    due_date: "2026-03-25",
    needs_validation: true,
    points: 3,
    required_skills: "testing,ruby",
    team_id: 1,
    user_id: 2,
  },
  {
    id: 1003,
    all_states: "UNASSIGNED,ASSIGNED,DEVELOPMENT,TESTING,COMPLETED",
    completed_by_id: null,
    created_by: 1,
    current_state: "ASSIGNED",
    description: "Set up monitoring dashboard",
    due_date: "2026-03-24",
    needs_validation: true,
    points: 8,
    required_skills: "devops",
    team_id: 1,
    user_id: 5,
  },
  {
    id: 1004,
    all_states: "UNASSIGNED,ASSIGNED,COMPLETED",
    completed_by_id: null,
    created_by: 1,
    current_state: "UNASSIGNED",
    description: "Refactor email sender job",
    due_date:"2026-03-24",
    needs_validation: false,
    points: 2,
    required_skills: "ruby",
    team_id: 1,
    user_id: null,
  },
  {
    id: 1005,
    all_states: "UNASSIGNED,ASSIGNED,COMPLETED",
    completed_by_id: null,
    created_by: 1,
    current_state: "ASSIGNED",
    description: "Update team settings UI",
    due_date: "2026-03-24",
    needs_validation: false,
    points: 6,
    required_skills: "react,css",
    team_id: 1,
    user_id: 2,
  },
];

function splitCsv(value) {
  return value
    .toString()
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

function isPastDate(dateString) {
  return dayjs(dateString).isBefore(dayjs(), "day");
}

function taskVisualCategory(task, currentUserId) {
  if (task.completed_by_id === currentUserId) return "completedByMe";
  if (task.user_id === currentUserId) return "mine";
  if (!task.user_id && isPastDate(task.due_date)) return "unassignedPast";
  if (!task.user_id) return "unassigned";
  return "takenByOthers";
}

function eventColorFromCategory(category) {
  return COLORS[category] || COLORS.unassigned;
}

function canTakeTask(task, currentUser) {
  if (task.user_id) return false;
  if (task.current_state === "COMPLETED") return false;
  if (isPastDate(task.due_date)) return false;

  const required = splitCsv(task.required_skills);
  if (required.length === 0) return true;

  const userSkills = splitCsv(currentUser.skills);
  return required.every((skill) => userSkills.includes(skill));
}

function canPatchTask(task, currentUser) {
  return currentUser.role === 0 || task.user_id === currentUser.id;
}

function canProgressTask(task, currentUser) {
  return task.user_id === currentUser.id && task.current_state !== "COMPLETED";
}

export default function CalendarForTasks() {
  const { enqueueSnackbar } = useSnackbar();
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isCreationOpen, setIsCreationOpen] = useState(false);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [selectedTaskId, tasks],
  );

  const calendarEvents = useMemo(
    () =>
      [ ...tasks ]
      .sort((a, b) => {
        const aCategory = taskVisualCategory(a, mockCurrentUser.id);
        const bCategory = taskVisualCategory(b, mockCurrentUser.id);

        return COLOR_INDEX[aCategory] - COLOR_INDEX[bCategory];
      })
      .map((task) => {
        const category = taskVisualCategory(task, mockCurrentUser.id);
        const startDate = dayjs(task.due_date).format("YYYY-MM-DD");
        const endDateExclusive = dayjs(task.due_date).add(1, "day").format("YYYY-MM-DD");
        return {
          id: String(task.id),
          title: `${task.description || "(No description)"}`,
          start: startDate,
          end: endDateExclusive,
          allDay: true,
          backgroundColor: eventColorFromCategory(category),
          borderColor: eventColorFromCategory(category),
          textColor: "#ffffff",
          extendedProps: {
            task,
            category,
            all_day: true,
          },
        };
      }),
    [tasks],
  );

  const legendItems = [
    { label: "Owned by me", color: COLORS.mine },
    { label: "Completed by me", color: COLORS.completedByMe },
    { label: "Unassigned", color: COLORS.unassigned },
    { label: "Unassigned in past", color: COLORS.unassignedPast },
    { label: "Taken by someone else", color: COLORS.takenByOthers },
  ];

  const handleEventClick = (arg) => {
    setSelectedTaskId(Number(arg.event.id));
  };

  const handleClose = () => setSelectedTaskId(null);

  const handleTakeTask = () => {
    if (!selectedTask) return;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== selectedTask.id) return task;
        return {
          ...task,
          user_id: mockCurrentUser.id,
          current_state: task.current_state === "UNASSIGNED" ? "ASSIGNED" : task.current_state,
        };
      }),
    );

    enqueueSnackbar("Task taken successfully", { variant: "success" });
    handleClose();
  };

  const handleConfirmPatch = ({ description, points }) => {
    if (!selectedTask) return;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== selectedTask.id) return task;
        return {
          ...task,
          description,
          points,
        };
      }),
    );

    enqueueSnackbar("Task patched successfully", { variant: "success" });
  };

  const handleDeleteTask = () => {
    if (!selectedTask) return;

    setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id));
    enqueueSnackbar("Task deleted successfully", { variant: "success" });
    handleClose();
  };

  const handleProgressTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/tasks/${selectedTask.id}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        let message = "Failed to progress task";
        try {
          const data = await response.json();
          message = data?.error || data?.errors?.join(", ") || message;
        } catch (e) {
          // Keep fallback message when response body is not JSON.
        }
        enqueueSnackbar(message, { variant: "error" });
        return;
      }

      enqueueSnackbar("Task progress requested successfully", { variant: "success" });
      window.location.reload();
    } catch (error) {
      enqueueSnackbar("Network error while progressing task", { variant: "error" });
    }
  };

  const handleCreateTask = (newTask) => {
    const nextId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    setTasks((prev) => [
      {
        id: nextId,
        ...newTask,
      },
      ...prev,
    ]);
    enqueueSnackbar("Task created successfully", { variant: "success" });
  };

  const taskCanBeTaken = selectedTask ? canTakeTask(selectedTask, mockCurrentUser) : false;
  const taskCanBePatched = selectedTask ? canPatchTask(selectedTask, mockCurrentUser) : false;
  const taskCanProgress = selectedTask ? canProgressTask(selectedTask, mockCurrentUser) : false;

  return (
    <Box className="calendar-for-tasks-root">
      <Stack direction="row" spacing={1} className="calendar-for-tasks-legend" flexWrap="wrap">
        {legendItems.map((item) => (
          <Chip
            key={item.label}
            label={item.label}
            size="small"
            sx={{
              bgcolor: item.color,
              color: "#fff",
              borderRadius: "8px",
            }}
          />
        ))}
      </Stack>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        eventClick={handleEventClick}
        eventDisplay="block"
        displayEventTime={false}
        defaultAllDay
        dayMaxEventRows={6}
        fixedWeekCount={false}
        headerToolbar={{
          start: "today prev,next",
          center: "title",
          end: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
        height="calc(100vh - 180px)"
      />

      <Fab
        color="primary"
        aria-label="add-task"
        className="calendar-for-tasks-add-fab"
        onClick={() => setIsCreationOpen(true)}
      >
        <AddIcon />
      </Fab>

      <TaskDialog
        open={Boolean(selectedTask)}
        onClose={handleClose}
        task={selectedTask}
        currentUser={mockCurrentUser}
        canTake={taskCanBeTaken}
        canPatch={taskCanBePatched}
        canProgress={taskCanProgress}
        onTake={handleTakeTask}
        onProgress={handleProgressTask}
        onConfirmPatch={handleConfirmPatch}
        onDelete={handleDeleteTask}
      />

      <TaskCreationDialog
        open={isCreationOpen}
        onClose={() => setIsCreationOpen(false)}
        currentUser={mockCurrentUser}
        onCreate={handleCreateTask}
      />
    </Box>
  );
}
