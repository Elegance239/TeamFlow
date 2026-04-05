import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Button,
  Chip,
  Fab,
  LinearProgress,
  Stack,
  TextField,
  Typography,
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

function getStoredUser() {
  try {
    const raw = localStorage.getItem("teamflowCurrentUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function isTeamLead(role) {
  return role === 0 || role === "team_lead";
}

function splitCsv(value) {
  if (value === null || value === undefined) return [];

  const normalized = Array.isArray(value) ? value.join(",") : String(value);

  return normalized
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
  if (!currentUser) return false;
  if (task.user_id) return false;
  if (task.current_state === "COMPLETED") return false;
  if (isPastDate(task.due_date)) return false;

  const required = splitCsv(task.required_skills);
  if (required.length === 0) return true;

  const userSkills = splitCsv(currentUser.skills);
  return required.every((skill) => userSkills.includes(skill));
}

function canPatchTask(task, currentUser) {
  if (!currentUser) return false;
  return isTeamLead(currentUser.role) && task.created_by === currentUser.id;
}

function canProgressTask(task, currentUser) {
  if (!currentUser) return false;
  return task.user_id === currentUser.id && task.current_state !== "COMPLETED";
}

export default function CalendarForTasks({ openCreateTaskSignal, setOpenCreateTaskSignal }) {
  const { enqueueSnackbar } = useSnackbar();
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [noTeam, setNoTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isCreationOpen, setIsCreationOpen] = useState(false);

  useEffect(() => {
    if (openCreateTaskSignal) {
      setIsCreationOpen(true);
      if (setOpenCreateTaskSignal) setOpenCreateTaskSignal(false);
    }
  }, [openCreateTaskSignal, setOpenCreateTaskSignal]);

  const fetchTasks = async () => {
    const response = await fetch("/tasks", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      let message = "Failed to load tasks";
      try {
        const data = await response.json();
        message = data?.error || data?.errors?.join(", ") || message;
      } catch (error) {
        // Keep fallback message when response body is not JSON.
      }

      if (message === "User is not part of a team") {
        const noTeamError = new Error(message);
        noTeamError.code = "no_team";
        throw noTeamError;
      }

      throw new Error(message);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  const refreshTasks = async () => {
    const loadedTasks = await fetchTasks();
    setTasks(loadedTasks);
  };

  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const storedUser = getStoredUser();
        if (storedUser?.id) {
          const userResponse = await fetch(`/users/${storedUser.id}`, {
            method: "GET",
            headers: { Accept: "application/json" },
            credentials: "include",
          });

          if (userResponse.ok) {
            const resolvedUser = await userResponse.json();
            const mergedUser = {
              ...storedUser,
              ...resolvedUser,
              team_id: resolvedUser.team_id ?? resolvedUser.team?.id ?? storedUser.team_id,
            };
            localStorage.setItem("teamflowCurrentUser", JSON.stringify(mergedUser));
            if (alive) setCurrentUser(mergedUser);
          } else if (alive) {
            setCurrentUser(storedUser);
          }
        }

        const loadedTasks = await fetchTasks();
        if (alive) {
          setTasks(loadedTasks);
          setNoTeam(false);
        }
      } catch (error) {
        if (alive) {
          if (error.code === "no_team") {
            setTasks([]);
            setNoTeam(true);
          } else {
            setTasks([]);
            enqueueSnackbar(error.message || "Failed to load task data", { variant: "error" });
          }
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      alive = false;
    };
  }, [enqueueSnackbar]);

  const handleCreateTeam = async () => {
    const cleanedName = teamName.trim();
    if (!cleanedName) {
      enqueueSnackbar("Please enter a team name", { variant: "warning" });
      return;
    }

    try {
      setIsCreatingTeam(true);
      const response = await fetch("/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: cleanedName }),
      });

      if (!response.ok) {
        let message = "Failed to create team";
        try {
          const data = await response.json();
          message = data?.error || data?.errors?.join(", ") || message;
        } catch (error) {
          // Keep fallback message when response body is not JSON.
        }
        enqueueSnackbar(message, { variant: "error" });
        return;
      }

      const payload = await response.json();
      const storedUser = getStoredUser();
      const mergedUser = {
        ...storedUser,
        ...payload.user,
        team_id: payload.team?.id ?? payload.user?.team_id,
      };
      localStorage.setItem("teamflowCurrentUser", JSON.stringify(mergedUser));
      setCurrentUser(mergedUser);
      setNoTeam(false);
      setTeamName("");
      await refreshTasks();
      enqueueSnackbar("Team created successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Network error while creating team", { variant: "error" });
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [selectedTaskId, tasks],
  );

  const calendarEvents = useMemo(
    () =>
      [ ...tasks ]
      .sort((a, b) => {
        const viewerId = currentUser?.id ?? -1;
        const aCategory = taskVisualCategory(a, viewerId);
        const bCategory = taskVisualCategory(b, viewerId);

        return COLOR_INDEX[aCategory] - COLOR_INDEX[bCategory];
      })
      .map((task) => {
        const category = taskVisualCategory(task, currentUser?.id ?? -1);
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
    [currentUser, tasks],
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

  const handleTakeTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/tasks/${selectedTask.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        let message = "Failed to take task";
        try {
          const data = await response.json();
          message = data?.error || data?.errors?.join(", ") || message;
        } catch (error) {
          // Keep fallback message when response body is not JSON.
        }
        enqueueSnackbar(message, { variant: "error" });
        return;
      }

      await refreshTasks();
      enqueueSnackbar("Task taken successfully", { variant: "success" });
      handleClose();
    } catch (error) {
      enqueueSnackbar("Network error while taking task", { variant: "error" });
    }
  };

  const handleConfirmPatch = async ({ description, points }) => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ description, points }),
      });

      if (!response.ok) {
        let message = "Failed to patch task";
        try {
          const data = await response.json();
          message = data?.error || data?.errors?.join(", ") || message;
        } catch (error) {
          // Keep fallback message when response body is not JSON.
        }
        enqueueSnackbar(message, { variant: "error" });
        return;
      }

      await refreshTasks();
      enqueueSnackbar("Task patched successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Network error while patching task", { variant: "error" });
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/tasks/${selectedTask.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        let message = "Failed to delete task";
        try {
          const data = await response.json();
          message = data?.error || data?.errors?.join(", ") || message;
        } catch (error) {
          // Keep fallback message when response body is not JSON.
        }
        enqueueSnackbar(message, { variant: "error" });
        return;
      }

      await refreshTasks();
      enqueueSnackbar("Task deleted successfully", { variant: "success" });
      handleClose();
    } catch (error) {
      enqueueSnackbar("Network error while deleting task", { variant: "error" });
    }
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
        credentials: "include",
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

  const handleCreateTask = async (newTask) => {
    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        let message = "Failed to create task";
        try {
          const data = await response.json();
          message = data?.error || data?.errors?.join(", ") || message;
        } catch (error) {
          // Keep fallback message when response body is not JSON.
        }
        enqueueSnackbar(message, { variant: "error" });
        return false;
      }

      await refreshTasks();
      enqueueSnackbar("Task created successfully", { variant: "success" });
      return true;
    } catch (error) {
      enqueueSnackbar("Network error while creating task", { variant: "error" });
      return false;
    }
  };

  const taskCanBeTaken = selectedTask ? canTakeTask(selectedTask, currentUser) : false;
  const taskCanBePatched = selectedTask ? canPatchTask(selectedTask, currentUser) : false;
  const taskCanProgress = selectedTask ? canProgressTask(selectedTask, currentUser) : false;
  const safeCurrentUser = currentUser || {
    id: null,
    name: "Unknown User",
    email: "unknown@example.com",
    role: "team_member",
    skills: "",
    team_id: null,
  };
  const canCreateTask = isTeamLead(safeCurrentUser.role);

  return (
    <Box className="calendar-for-tasks-root">
      {isLoading && <LinearProgress sx={{ mb: 1 }} />}

      {noTeam && (
        <Box sx={{ mb: 2, p: 2, border: "1px dashed #c9c9c9", borderRadius: 2, bgcolor: "#fafafa" }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>You are not part of a team yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Create a team to start using task calendar features.
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              label="Team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleCreateTeam}
              disabled={isCreatingTeam}
              sx={{ bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" } }}
            >
              {isCreatingTeam ? "Creating..." : "Create Team"}
            </Button>
          </Stack>
        </Box>
      )}

      {!noTeam && (
        <>
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
        </>
      )}

      <Fab
        color="primary"
        aria-label="add-task"
        className="calendar-for-tasks-add-fab"
        disabled={!canCreateTask || noTeam}
        onClick={() => setIsCreationOpen(true)}
      >
        <AddIcon />
      </Fab>

      <TaskDialog
        open={Boolean(selectedTask)}
        onClose={handleClose}
        task={selectedTask}
        currentUser={safeCurrentUser}
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
        currentUser={safeCurrentUser}
        onCreate={handleCreateTask}
      />
    </Box>
  );
}
