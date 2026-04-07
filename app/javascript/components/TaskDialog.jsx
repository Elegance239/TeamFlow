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

function roleText(role) {
  return role === 0 || role === "team_lead" ? "team_lead" : "team_member";
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
  canTake,
  canPatch,
  canProgress,
  onTake,
  onProgress,
  onUnclaim,
  onConfirmPatch,
  onDelete,
}) {
  const [isPatching, setIsPatching] = useState(false);
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");

  useEffect(() => {
    if (!task) {
      setIsPatching(false);
      setDescription("");
      setPoints("");
      return;
    }

    setIsPatching(false);
    setDescription(task.description || "");
    setPoints(task.points ?? "");
  }, [task]);

  const normalizedPoints = useMemo(() => {
    const parsed = Number(points);
    if (!Number.isFinite(parsed)) return null;
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  }, [points]);

  const canConfirmPatch = isPatching && canPatch && normalizedPoints !== null;

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

  const nextState = useMemo(() => {
    if (!task?.current_state || workflowStates.length === 0) return null;
    const currentIndex = workflowStates.indexOf(task.current_state);
    if (currentIndex < 0 || currentIndex >= workflowStates.length - 1) return null;
    return workflowStates[currentIndex + 1];
  }, [task, workflowStates]);

  const handleConfirmPatch = () => {
    if (!canConfirmPatch || !task) return;

    onConfirmPatch({
      description: description.trim(),
      points: normalizedPoints,
    });
    setIsPatching(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Task Details</Typography>
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
                <Typography><strong>user_id:</strong> {task.user_id ?? "null"}</Typography>
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
        {isPatching ? (
          <Button
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

        {!isPatching && (
          <Button
            variant="contained"
            disabled={!canPatch}
            onClick={onDelete}
            sx={{
              bgcolor: canPatch ? "#d32f2f" : "#9e9e9e",
              color: "#fff",
              "&:hover": {
                bgcolor: canPatch ? "#b71c1c" : "#9e9e9e",
              },
            }}
          >
            DELETE
          </Button>
        )}

        <Button
          variant="contained"
          onClick={onTake}
          disabled={!canTake || isPatching}
          sx={{
            bgcolor: canTake && !isPatching ? "#d32f2f" : "#9e9e9e",
            color: "#fff",
            "&:hover": {
              bgcolor: canTake && !isPatching ? "#b71c1c" : "#9e9e9e",
            },
          }}
        >
          Take
        </Button>

        <Button
          variant="contained"
          onClick={onUnclaim}
          disabled={!canProgress || isPatching}
          sx={{
            bgcolor: canProgress && !isPatching ? "#ed6c02" : "#9e9e9e",
            color: "#fff",
            "&:hover": {
              bgcolor: canProgress && !isPatching ? "#e65100" : "#9e9e9e",
            },
          }}
        >
          Unclaim Task
        </Button>

        <Button
          variant="contained"
          onClick={onProgress}
          disabled={!canProgress || isPatching || !nextState}
          sx={{
            bgcolor: canProgress && !isPatching && nextState ? "#d32f2f" : "#9e9e9e",
            color: "#fff",
            "&:hover": {
              bgcolor: canProgress && !isPatching && nextState ? "#b71c1c" : "#9e9e9e",
            },
          }}
        >
          PROGRESS
        </Button>
      </DialogActions>
    </Dialog>
  );
}
