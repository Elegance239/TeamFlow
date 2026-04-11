import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const STATE_COLORS = {
  UNASSIGNED: "#757575",
  ASSIGNED: "#1e88e5",
  DEVELOPMENT: "#fb8c00",
  TESTING: "#8e24aa",
  PRODUCTION: "#00897b",
  COMPLETED: "#2e7d32",
};

const isTeamLead = (role) => {
  const r = String(role);
  return r === "0" || r === "team_lead";
};

const isTeamMember = (role) => {
  const r = String(role);
  return r === "1" || r === "team_member";
};

function roleText(role) {
  return isTeamLead(role) ? "team_lead" : "team_member";
}

function stateChipSx(state) {
  return {
    bgcolor: STATE_COLORS[state] || "#9e9e9e",
    color: "#fff",
    fontWeight: 700,
  };
}

export default function TaskDialog({
  open,
  onClose,
  task,
  currentUser,
  canTake: propCanTake,
  canPatch,
  canProgress: propCanProgress,
  onTake,
  onProgress,
  onUnclaim,
  onConfirmPatch,
  onDelete,
  teamUsers = [],
}) {
  const [isPatching, setIsPatching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (!task) {
      setIsPatching(false);
      setIsDeleting(false);
      setTitle("");
      setDescription("");
      setPoints("");
      setUserId("");
      return;
    }

    setIsPatching(false);
    setIsDeleting(false);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setPoints(task.points ?? "");
    setUserId(task.user_id ?? "");
  }, [task]);

  const normalizedPoints = useMemo(() => {
    const parsed = Number(points);
    if (!Number.isFinite(parsed)) return null;
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  }, [points]);

  const canConfirmPatch = isPatching && canPatch && Boolean(title.trim()) && normalizedPoints !== null;

  const workflowStates = useMemo(() => {
    if (!task) return [];

    const rawStates = Array.isArray(task.all_states)
      ? task.all_states
      : (task.all_states || "")
        .toString()
        .split(",");

    const cleaned = rawStates
      .map((s) => s.toString().trim())
      .filter(Boolean);

    if (cleaned.length > 0) return cleaned;
    if (task.current_state) return [task.current_state];
    return [];
  }, [task]);

  const canTake = isTeamMember(currentUser?.role) && task?.current_state === "UNASSIGNED";
  const canUnclaim = isTeamMember(currentUser?.role) &&
    task?.user_id &&
    Number(task.user_id) === Number(currentUser?.id) &&
    task.current_state !== "COMPLETED";
  const canProgress = task?.user_id &&
    Number(task.user_id) === Number(currentUser?.id) &&
    task.current_state !== "COMPLETED";

  if (window.Cypress || window.isCucumber) {
    console.log("TaskDialog State:", {
      role: currentUser?.role,
      isLead: isTeamLead(currentUser?.role),
      isMember: isTeamMember(currentUser?.role),
      taskUser: task?.user_id,
      currentUserId: currentUser?.id,
      canTake, canUnclaim, canProgress
    });
  }

  const nextState = useMemo(() => {
    if (!task?.current_state || workflowStates.length === 0) return null;
    const currentIndex = workflowStates.indexOf(task.current_state);
    if (currentIndex < 0 || currentIndex >= workflowStates.length - 1) return null;
    return workflowStates[currentIndex + 1];
  }, [task, workflowStates]);

  const handleConfirmPatch = () => {
    if (!canConfirmPatch || !task) return;

    onConfirmPatch({
      title: title.trim(),
      description: description.trim(),
      points: normalizedPoints,
      user_id: userId || null,
    });
    setIsPatching(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {task?.title || "Task Details"}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip label={`Viewer: ${currentUser.name}`} size="small" variant="outlined" />
            <Chip label={`Role: ${roleText(currentUser.role)}`} size="small" />
            <Chip label={`Email: ${currentUser.email}`} size="small" variant="outlined" />
          </Stack>
        </Stack>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {task && (
          <Stack spacing={1.4}>
            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: "#f8faff", border: "1px solid #dbe5ff" }}>
              <Typography variant="subtitle2" color="text.secondary">Workflow</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                {workflowStates.map((state) => (
                  <Chip key={state} label={state} size="small" sx={stateChipSx(state)} />
                ))}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.2 }}>
                <Typography variant="body2" color="text.secondary">Current:</Typography>
                <Chip label={task.current_state || ""} size="small" sx={stateChipSx(task.current_state)} />
              </Stack>
            </Box>

            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: "#fafafa", border: "1px solid #ececec" }}>
              <Typography variant="subtitle2" color="text.secondary">Task Meta</Typography>
              <Stack spacing={0.8} sx={{ mt: 1 }}>
                <Typography><strong>id:</strong> {task.id}</Typography>
                {isPatching && (
                  <TextField
                    label="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    size="small"
                    fullWidth
                    required
                    sx={{ mb: 1 }}
                  />
                )}
                {isPatching ? (
                  <TextField
                    label="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                  />
                ) : (
                  <Typography><strong>description:</strong> {task.description || ""}</Typography>
                )}
                <Typography><strong>due_date:</strong> {task.due_date || ""}</Typography>
                <Typography><strong>all_day:</strong> true</Typography>
                {isPatching ? (
                  <TextField
                    label="points"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    size="small"
                    type="number"
                    inputProps={{ min: 1, step: 1 }}
                    error={points !== "" && normalizedPoints === null}
                    helperText={points !== "" && normalizedPoints === null ? "Must be a positive integer" : ""}
                  />
                ) : (
                  <Typography><strong>points:</strong> {task.points ?? "null"}</Typography>
                )}
                <Typography><strong>needs_validation:</strong> {String(Boolean(task.needs_validation))}</Typography>
              </Stack>
            </Box>

            <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: "#fffaf3", border: "1px solid #ffe4ba" }}>
              <Typography variant="subtitle2" color="text.secondary">Ownership And Skills</Typography>
              <Stack spacing={0.8} sx={{ mt: 1 }}>
                <Typography><strong>created_by:</strong> {task.created_by ?? "null"}</Typography>
                {isPatching && isTeamLead(currentUser.role) ? (
                  <FormControl fullWidth size="small">
                    <InputLabel id="assignee-select-label">Assignee</InputLabel>
                    <Select
                      labelId="assignee-select-label"
                      value={userId}
                      label="Assignee"
                      onChange={(e) => setUserId(e.target.value)}
                    >
                      <MenuItem value=""><em>Unassigned</em></MenuItem>
                      {teamUsers.map((u) => (
                        <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography><strong>user_id:</strong> {task.user_id ?? "null"}</Typography>
                )}
                <Typography><strong>completed_by_id:</strong> {task.completed_by_id ?? "null"}</Typography>
                <Typography><strong>required_skills:</strong> {task.required_skills || ""}</Typography>
              </Stack>
            </Box>

            <Divider />

            <Typography variant="body2" color="text.secondary">
              Eligible for self-election: {canTake ? "Yes" : "No"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patch permission: {canPatch ? "Yes" : "No"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Next state: {nextState || "No further state"}
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {isDeleting ? (
          canPatch && (
            <Button
              id="task-dialog-confirm-button"
              variant="contained"
              onClick={onDelete}
              sx={{
                bgcolor: "#d32f2f",
                color: "#fff",
                "&:hover": { bgcolor: "#b71c1c" },
              }}
            >
              CONFIRM
            </Button>
          )
        ) : isPatching ? (
          <Button
            id="task-dialog-confirm-button"
            variant="contained"
            disabled={!canConfirmPatch}
            onClick={handleConfirmPatch}
            sx={{
              bgcolor: canConfirmPatch ? "#d32f2f" : "#9e9e9e",
              color: "#fff",
              "&:hover": {
                bgcolor: canConfirmPatch ? "#b71c1c" : "#9e9e9e",
              },
            }}
          >
            CONFIRM
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={!canPatch}
            onClick={() => setIsPatching(true)}
            sx={{
              bgcolor: canPatch ? "#d32f2f" : "#9e9e9e",
              color: "#fff",
              "&:hover": {
                bgcolor: canPatch ? "#b71c1c" : "#9e9e9e",
              },
            }}
          >
            PATCH
          </Button>
        )}

        {!isPatching && !isDeleting && canPatch && (
          <Button
            variant="contained"
            onClick={() => setIsDeleting(true)}
            sx={{
              bgcolor: "#d32f2f",
              color: "#fff",
              "&:hover": {
                bgcolor: "#b71c1c",
              },
            }}
          >
            DELETE
          </Button>
        )}

        {canTake && (
          <Button
            id="take-button"
            data-testid="take-button"
            variant="contained"
            onClick={onTake}
            sx={{
              bgcolor: "#d32f2f",
              color: "#fff",
              "&:hover": {
                bgcolor: "#b71c1c",
              },
            }}
          >
            Take
          </Button>
        )}

        {!isPatching && canUnclaim && (
          <Button
            id="unclaim-button"
            variant="contained"
            onClick={onUnclaim}
            sx={{
              bgcolor: "#757575",
              color: "#fff",
              "&:hover": { bgcolor: "#616161" },
            }}
          >
            Unclaim
          </Button>
        )}

        {canProgress && !isPatching && nextState && (
          <Button
            id="progress-button"
            variant="contained"
            onClick={onProgress}
            sx={{
              bgcolor: "#d32f2f",
              color: "#fff",
              "&:hover": {
                bgcolor: "#b71c1c",
              },
            }}
          >
            PROGRESS
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
