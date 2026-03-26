import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function normalizeSkills(raw) {
  return raw
    .toString()
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .filter((s, idx, arr) => arr.indexOf(s) === idx)
    .join(",");
}

export default function TaskCreationDialog({ open, onClose, currentUser, onCreate }) {
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState(1);
  const [requiredSkills, setRequiredSkills] = useState("");
  const [needsValidation, setNeedsValidation] = useState(false);
  const [allStates, setAllStates] = useState("UNASSIGNED,ASSIGNED,COMPLETED");
  const [userId, setUserId] = useState("");

  const isTeamLead = currentUser.role === 0;

  const parsedPoints = useMemo(() => {
    const p = Number(points);
    if (!Number.isFinite(p)) return null;
    if (!Number.isInteger(p) || p <= 0) return null;
    return p;
  }, [points]);

  const canCreate = isTeamLead && Boolean(dueDate) && parsedPoints !== null;

  const resetForm = () => {
    setDescription("");
    setDueDate("");
    setPoints(1);
    setRequiredSkills("");
    setNeedsValidation(false);
    setAllStates("UNASSIGNED,ASSIGNED,COMPLETED");
    setUserId("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleConfirm = () => {
    if (!canCreate) return;

    const parsedUserId = userId === "" ? null : Number(userId);
    const createdTask = {
      description: description.trim(),
      due_date: dueDate,
      points: parsedPoints,
      required_skills: normalizeSkills(requiredSkills),
      needs_validation: needsValidation,
      all_states: allStates.trim() || "UNASSIGNED,ASSIGNED,COMPLETED",
      user_id: Number.isFinite(parsedUserId) ? parsedUserId : null,
      created_by: currentUser.id,
      team_id: currentUser.team_id,
      completed_by_id: null,
      current_state: Number.isFinite(parsedUserId) ? "ASSIGNED" : "UNASSIGNED",
    };

    onCreate(createdTask);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        Create Task
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Backend contract: due_date, points, description?, required_skills?, needs_validation?, all_states?, user_id?
          </Typography>
          {!isTeamLead && (
            <Typography variant="body2" color="error">
              Only team leads can create tasks.
            </Typography>
          )}

          <TextField
            label="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            label="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split("T")[0] }}
            fullWidth
          />
          <TextField
            label="points"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            inputProps={{ min: 1, step: 1 }}
            error={points !== "" && parsedPoints === null}
            helperText={points !== "" && parsedPoints === null ? "Must be a positive integer" : ""}
            fullWidth
          />
          <TextField
            label="required_skills (comma-separated)"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            fullWidth
          />
          <TextField
            label="all_states (comma-separated)"
            value={allStates}
            onChange={(e) => setAllStates(e.target.value)}
            fullWidth
          />
          <TextField
            label="user_id (optional assignee)"
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            inputProps={{ min: 1, step: 1 }}
            fullWidth
          />
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={needsValidation}
                  onChange={(e) => setNeedsValidation(e.target.checked)}
                />
              }
              label="needs_validation"
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!canCreate}
          sx={{
            bgcolor: canCreate ? "#d32f2f" : "#9e9e9e",
            color: "#fff",
            "&:hover": {
              bgcolor: canCreate ? "#b71c1c" : "#9e9e9e",
            },
          }}
        >
          CONFIRM
        </Button>
      </DialogActions>
    </Dialog>
  );
}
