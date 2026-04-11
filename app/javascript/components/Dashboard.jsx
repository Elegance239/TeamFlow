import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import TaskDialog from "./TaskDialog";

const STATE_COLORS = {
  UNASSIGNED: "#757575",
  ASSIGNED: "#1e88e5",
  DEVELOPMENT: "#fb8c00",
  TESTING: "#8e24aa",
  PRODUCTION: "#00897b",
  COMPLETED: "#2e7d32",
};

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

function DashboardSection({ title, color, tasks = [], sx = {}, onTaskClick }) {
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
              <TaskCard
                key={task.id}
                className="task-card"
                color={color}
                onClick={() => onTaskClick?.(task)}
                sx={{
                  cursor: "pointer",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
                  },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
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

function RankingSection({ rankingData = [], currentUserId, teamName }) {
  const maxScore = Math.max(...rankingData.map((u) => u.overall_score || 0), 1);

  return (
    <Panel sx={{ height: "100%" }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {teamName ? `${teamName} Scoreboard` : "Scoreboard"}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "calc(100% - 40px)",
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {rankingData.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              border: "1px dashed #cbd5e1",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
            }}
          >
            No ranking data yet
          </Box>
        ) : (
          rankingData.map((user, index) => {
            const score = user.overall_score || 0;
            const width = `${(score / maxScore) * 100}%`;
            const isMe = user.id === currentUserId;

            return (
              <Box
                key={user.id}
                sx={{
                  p: 2,
                  border: "1px solid #e5e7eb",
                  borderRadius: 3,
                  backgroundColor: isMe ? "#eff6ff" : "#fff",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    #{index + 1} {user.name} {isMe ? "(You)" : ""}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{score} pts</Typography>
                </Box>

                <Box
                  sx={{
                    height: 12,
                    borderRadius: 999,
                    backgroundColor: "#e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width,
                      height: "100%",
                      borderRadius: 999,
                      background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                    }}
                  />
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Panel>
  );
}

function groupTasksByWorkflow(tasks) {
  return {
    UNASSIGNED: tasks.filter((task) => task.current_state === "UNASSIGNED"),
    ASSIGNED: tasks.filter((task) => task.current_state === "ASSIGNED"),
    DEVELOPMENT: tasks.filter((task) => task.current_state === "DEVELOPMENT"),
    TESTING: tasks.filter((task) => task.current_state === "TESTING"),
    PRODUCTION: tasks.filter((task) => task.current_state === "PRODUCTION"),
    COMPLETED: tasks.filter((task) => task.current_state === "COMPLETED"),
  };
}

export default function Dashboard() {
  const { enqueueSnackbar } = useSnackbar();
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [noTeam, setNoTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [teamUsers, setTeamUsers] = useState([]);
  const [pendings, setPendings] = useState([]);

  const [workflowTasks, setWorkflowTasks] = useState({
    UNASSIGNED: [],
    ASSIGNED: [],
    DEVELOPMENT: [],
    TESTING: [],
    PRODUCTION: [],
    COMPLETED: [],
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
    setWorkflowTasks(groupTasksByWorkflow(loadedTasks));
  };

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [selectedTaskId, tasks],
  );

  const rankingData = useMemo(() => {
    return teamUsers
      .map((user) => {
        const overall_score = tasks
          .filter((task) => task.completed_by_id === user.id)
          .reduce((sum, task) => sum + (task.points || 0), 0);

        return { ...user, overall_score };
      })
      .sort((a, b) => b.overall_score - a.overall_score);
  }, [teamUsers, tasks]);

  const fetchTeamInfo = async (teamId) => {
    const response = await fetch(`/teams/${teamId}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      let message = "Failed to load team info";
      try {
        const data = await response.json();
        message = data?.error || data?.errors?.join(", ") || message;
      } catch (error) { }
      throw new Error(message);
    }

    return await response.json();
  };

  const fetchTeamMembers = async (teamId) => {
    const response = await fetch(`/teams/${teamId}/members`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to load team members");
    }

    return await response.json();
  };

  const handleClose = () => setSelectedTaskId(null);

  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      setIsLoading(true);

      try {
        let activeUser = getStoredUser();

        if (activeUser?.id) {
          const userResponse = await fetch(`/users/${activeUser.id}`, {
            method: "GET",
            headers: { Accept: "application/json" },
            credentials: "include",
          });

          if (userResponse.ok) {
            const resolvedUser = await userResponse.json();

            activeUser = {
              ...activeUser,
              ...resolvedUser,
              team_id:
                resolvedUser.team_id ??
                resolvedUser.team?.id ??
                activeUser.team_id,
            };

            localStorage.setItem(
              "teamflowCurrentUser",
              JSON.stringify(activeUser),
            );

            if (alive) setCurrentUser(activeUser);
          }
        }

        const loadedTasks = await fetchTasks();

        if (alive) {
          setTasks(loadedTasks);
          setWorkflowTasks(groupTasksByWorkflow(loadedTasks));
          setNoTeam(false);
        }

        if (activeUser?.team_id) {
          const teamInfo = await fetchTeamInfo(activeUser.team_id);

          if (alive) {
            setTeamName(teamInfo.name || "");
          }

          if (isTeamLead(activeUser.role)) {
            const [members, pendingList] = await Promise.all([
              fetchTeamMembers(activeUser.team_id),
              fetchPendings()
            ]);

            if (alive) {
              setTeamUsers(Array.isArray(members) ? members : []);
              setPendings(Array.isArray(pendingList) ? pendingList : []);
            }
          } else if (alive) {
            setTeamUsers([]);
          }
        } else if (alive) {
          setTeamName("");
          setTeamUsers([]);
        }
      } catch (error) {
        if (alive) {
          if (error.code === "no_team") {
            setTasks([]);
            setTeamUsers([]);
            setNoTeam(true);
          } else {
            setTasks([]);
            setTeamUsers([]);
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

  const handleConfirmPatch = async ({ title, description, points, user_id }) => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ description, points, user_id, title }),
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
      enqueueSnackbar("Network error while patching task", {
        variant: "error",
      });
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
      enqueueSnackbar("Network error while deleting task", {
        variant: "error",
      });
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

      enqueueSnackbar("Task progress requested successfully", {
        variant: "success",
      });
      await refreshTasks();
      enqueueSnackbar("Task progressed successfully", { variant: "success" });
      handleClose();
    } catch (error) {
      enqueueSnackbar("Network error while progressing task", {
        variant: "error",
      });
    }
  };

  const handleUnclaimTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/tasks/${selectedTask.id}/unassign`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        enqueueSnackbar("Failed to unclaim task", { variant: "error" });
        return;
      }

      enqueueSnackbar("Task unclaimed successfully", { variant: "success" });
      await refreshTasks();
      handleClose();
    } catch (error) {
      enqueueSnackbar("Network error while unclaiming task", {
        variant: "error",
      });
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`/task_transition_pendings/${id}/approve`, {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Approval failed");
      enqueueSnackbar("Approved successfully", { variant: "success" });
      refreshTasks();
      const nextPendings = await fetchPendings();
      setPendings(nextPendings);
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`/task_transition_pendings/${id}/reject`, {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Rejection failed");
      enqueueSnackbar("Rejected successfully", { variant: "success" });
      const nextPendings = await fetchPendings();
      setPendings(nextPendings);
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const taskCanBeTaken = selectedTask
    ? canTakeTask(selectedTask, currentUser)
    : false;
  const taskCanBePatched = selectedTask
    ? canPatchTask(selectedTask, currentUser)
    : false;
  const taskCanProgress = selectedTask
    ? canProgressTask(selectedTask, currentUser)
    : false;
  const safeCurrentUser = currentUser || {
    id: null,
    name: "Unknown User",
    email: "unknown@example.com",
    role: "team_member",
    skills: "",
    team_id: null,
  };

  const handleTaskClick = (task) => {
    setSelectedTaskId(task.id);
  };

  return (
    <>
      {isLoading && <LinearProgress sx={{ mb: 1 }} />}
      <Typography variant="h4" id="dashboard-title" sx={{ fontWeight: 700, p: 2, pb: 0 }}>
        Dashboard
      </Typography>
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
                  color={STATE_COLORS.UNASSIGNED}
                  tasks={workflowTasks.UNASSIGNED}
                  sx={{ flex: 1 }}
                  onTaskClick={handleTaskClick}
                />
                <DashboardSection
                  title="Development"
                  color={STATE_COLORS.DEVELOPMENT}
                  tasks={workflowTasks.DEVELOPMENT}
                  sx={{ flex: 1 }}
                  onTaskClick={handleTaskClick}
                />
              </Box>

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
                  title="Assigned"
                  color={STATE_COLORS.ASSIGNED}
                  tasks={workflowTasks.ASSIGNED}
                  sx={{ flex: 1 }}
                  onTaskClick={handleTaskClick}
                />
                <DashboardSection
                  title="Testing"
                  color={STATE_COLORS.TESTING}
                  tasks={workflowTasks.TESTING}
                  sx={{ flex: 1 }}
                  onTaskClick={handleTaskClick}
                />
              </Box>

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
                  title="Completed"
                  color={STATE_COLORS.COMPLETED}
                  tasks={workflowTasks.COMPLETED}
                  sx={{ flex: 1 }}
                  onTaskClick={handleTaskClick}
                />
                <DashboardSection
                  title="Production"
                  color={STATE_COLORS.PRODUCTION}
                  tasks={workflowTasks.PRODUCTION}
                  sx={{ flex: 1 }}
                  onTaskClick={handleTaskClick}
                />
              </Box>
            </Box>
          </Panel>
        </Grid>

        <Grid sx={{ flex: 1 }}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <RankingSection
              rankingData={rankingData}
              currentUserId={currentUser?.id}
              teamName={teamName}
            />

            {isTeamLead(currentUser?.role) && pendings.length > 0 && (
              <Panel sx={{ flex: 1, minHeight: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Pending Approvals
                </Typography>
                <Box sx={{ overflowY: "auto", height: "calc(100% - 40px)" }}>
                <Stack spacing={1.5}>
                  {pendings.map((p) => (
                    <Paper key={p.id} sx={{ p: 1.5, border: "1px solid #e5e7eb", borderRadius: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {tasks.find(t => t.id === p.task_id)?.title || "Task #" + p.task_id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {p.from_state} → {p.to_state}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button size="small" variant="contained" color="success" onClick={() => handleApprove(p.id)}>Approve</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => handleReject(p.id)}>Reject</Button>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
                </Box>
              </Panel>
            )}
          </Stack>
        </Grid>
      </Grid>
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
        onUnclaim={handleUnclaimTask}
        onConfirmPatch={handleConfirmPatch}
        onDelete={handleDeleteTask}
        teamUsers={teamUsers}
      />
    </>
  );
}
