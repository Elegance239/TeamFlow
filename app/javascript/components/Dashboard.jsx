import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Chip,
  Fab,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  Grid,
  Paper,
  autocompleteClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import TaskDialog from "./TaskDialog";

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

function groupTasksByCategory(tasks, currentUserId) {
  const grouped = {
    mine: [],
    completedByMe: [],
    unassigned: [],
    unassignedPast: [],
    takenByOthers: [],
  };

  tasks.forEach((task) => {
    const category = taskVisualCategory(task, currentUserId);
    grouped[category].push(task);
  });

  return grouped;
}

const Panel = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(2),
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  height: "100%",
  boxSizing: "border-box",
}));

const SectionBox = styled(Box)(({ theme }) => ({
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  padding: theme.spacing(1.5),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  minHeight: 0,
  height: "100%",
}));

const TaskCard = styled(Box)(({ color }) => ({
  borderLeft: `6px solid ${color || "#9e9e9e"}`,
  borderRadius: 12,
  background: "#fff",
  padding: "12px 14px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
}));

function DashboardSection({ title, color, tasks = [], sx = {} }) {
  return (
    <SectionBox sx={{ flex: 1, minHeight: 0, ...sx }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 0.5 }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Chip
          label={tasks.length}
          size="small"
          sx={{
            backgroundColor: color,
            color: "#fff",
            fontWeight: 700,
          }}
        />
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5, minHeight: 0 }}>
        {tasks.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              minHeight: 100,
              border: "1px dashed #cbd5e1",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              fontSize: 14,
            }}
          >
            No tasks yet
          </Box>
        ) : (
          <Stack spacing={1}>
            {tasks.map((task) => (
              <TaskCard key={task.id} color={color}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {task.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.5 }}
                >
                  {task.description || "No description"}
                </Typography>
              </TaskCard>
            ))}
          </Stack>
        )}
      </Box>
    </SectionBox>
  );
}

export default function Dashboard() {
  const { enqueueSnackbar } = useSnackbar();
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [noTeam, setNoTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isCreationOpen, setIsCreationOpen] = useState(false);

  const [sortedTasks, setSortedTasks] = useState({
    mine: [],
    completedByMe: [],
    unassigned: [],
    unassignedPast: [],
    takenByOthers: [],
  });

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

    const groupedTasks = groupTasksByCategory(loadedTasks, currentUser?.id);
    setSortedTasks(groupedTasks);
  };

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [selectedTaskId, tasks],
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
              team_id:
                resolvedUser.team_id ??
                resolvedUser.team?.id ??
                storedUser.team_id,
            };
            localStorage.setItem(
              "teamflowCurrentUser",
              JSON.stringify(mergedUser),
            );
            if (alive) setCurrentUser(mergedUser);
          } else if (alive) {
            setCurrentUser(storedUser);
          }
        }

        const loadedTasks = await fetchTasks();
        if (alive) {
          setTasks(loadedTasks);
          setSortedTasks(groupTasksByCategory(loadedTasks, currentUser?.id));
          setNoTeam(false);
        }
      } catch (error) {
        if (alive) {
          if (error.code === "no_team") {
            setTasks([]);
            setNoTeam(true);
          } else {
            setTasks([]);
            enqueueSnackbar(error.message || "Failed to load task data", {
              variant: "error",
            });
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

  return (
    <>
    {isLoading && <LinearProgress sx={{ mb: 1 }} />}
    <Grid
      container
      spacing={2}
      sx={{
        display: "flex",
        height: "calc(100vh - 128px)",
        boxSizing: "border-box",
        margin: 0,
      }}
    >
        
      <Grid sx={{ flex: 1 }}>
        <Panel sx={{ height: "100%" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Current Task Progression
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              height: "calc(100% - 40px)",
              minHeight: 0,
            }}
          >
            {/* LEFT COLUMN */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minHeight: 0,
              }}
            >
              <DashboardSection
                title="Owned by me"
                color={COLORS.mine}
                tasks={sortedTasks.mine}
                sx={{ flex: 1 }}
              />
              <DashboardSection
                title="Completed by me"
                color={COLORS.completedByMe}
                tasks={sortedTasks.completedByMe}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* RIGHT COLUMN */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minHeight: 0,
              }}
            >
              <DashboardSection
                title="Unassigned"
                color={COLORS.unassigned}
                tasks={sortedTasks.unassigned}
                sx={{ flex: 1 }}
              />
              <DashboardSection
                title="Unassigned in past"
                color={COLORS.unassignedPast}
                tasks={sortedTasks.unassignedPast}
                sx={{ flex: 1 }}
              />
              <DashboardSection
                title="Taken by someone else"
                color={COLORS.takenByOthers}
                tasks={sortedTasks.takenByOthers}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </Panel>
      </Grid>

      <Grid sx={{ flex: 2 }}>
        
      </Grid>
    </Grid>
    </>
  );
}
