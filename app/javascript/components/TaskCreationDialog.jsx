import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import axios from "axios";
import { InputAdornment, CircularProgress } from "@mui/material";

function normalizeSkills(raw) {
  return raw
    .toString()
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .filter((s, idx, arr) => arr.indexOf(s) === idx)
    .join(",");
}

const STATE_COLORS = {
  UNASSIGNED: "#757575",
  ASSIGNED: "#1e88e5",
  DEVELOPMENT: "#fb8c00",
  TESTING: "#8e24aa",
  PRODUCTION: "#00897b",
  COMPLETED: "#2e7d32",
};

const FIXED_STATES = ["UNASSIGNED", "ASSIGNED", "COMPLETED"];
const OPTIONAL_STATES = ["DEVELOPMENT", "TESTING", "PRODUCTION"];
const STANDARD_ORDER = ["UNASSIGNED", "ASSIGNED", "DEVELOPMENT", "TESTING", "PRODUCTION", "COMPLETED"];

function stateChipSx(state) {
  return {
    bgcolor: STATE_COLORS[state] || "#9e9e9e",
    color: "#fff",
    fontWeight: 700,
  };
}

export default function TaskCreationDialog({ open, onClose, currentUser, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [points, setPoints] = useState(1);
  const [requiredSkills, setRequiredSkills] = useState("");
  const [needsValidation, setNeedsValidation] = useState(false);
  const [allStates, setAllStates] = useState(FIXED_STATES);
  const [userId, setUserId] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const isTeamLead = currentUser.role === 0 || currentUser.role === "team_lead";

  const parsedPoints = useMemo(() => {
    const p = Number(points);
    if (!Number.isFinite(p)) return null;
    if (!Number.isInteger(p) || p <= 0) return null;
    return p;
  }, [points]);

  const canCreate = isTeamLead && Boolean(title.trim()) && Boolean(dueDate) && parsedPoints !== null;

  const handleAddState = (stateToAdd) => {
    const newStates = [...allStates, stateToAdd];
    newStates.sort((a, b) => STANDARD_ORDER.indexOf(a) - STANDARD_ORDER.indexOf(b));
    setAllStates(newStates);
  };

  const handleRemoveState = (stateToRemove) => {
    setAllStates(allStates.filter((s) => s !== stateToRemove));
  };

  const availableStatesToAdd = OPTIONAL_STATES.filter(s => !allStates.includes(s));

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(new Date().toISOString().split("T")[0]);
    setPoints(1);
    setRequiredSkills("");
    setNeedsValidation(false);
    setAllStates(FIXED_STATES);
    setUserId("");
    setAiPrompt("");
    setIsAiGenerating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleConfirm = async () => {
    if (!canCreate) return;

    const parsedUserId = userId === "" ? null : Number(userId);
    const createdTask = {
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate,
      points: parsedPoints,
      required_skills: normalizeSkills(requiredSkills),
      needs_validation: needsValidation,
      all_states: allStates.join(","),
      user_id: Number.isFinite(parsedUserId) ? parsedUserId : null,
    };

    const created = await onCreate(createdTask);
    if (created) {
      handleClose();
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || isAiGenerating) return;

    setIsAiGenerating(true);
    try {
      const response = await axios.post("/tasks/ai_generate", { prompt: aiPrompt });
      const data = response.data;

      if (data.error) {
        console.error("AI Error:", data.error);
      } else {
        //ai returns:title, description, points, due_days_from_now, required_skills
        const aiTitle = data.title || data.Title || "";
        const aiDesc = data.description || data.Description || "";
        
        setTitle(aiTitle.trim());
        setDescription(aiDesc.trim());
        
        if (data.points || data.Points) {
          setPoints(data.points || data.Points);
        }

        if (data.required_skills || data.Required_skills || data.requiredSkills) {
          setRequiredSkills(data.required_skills || data.Required_skills || data.requiredSkills);
        }

        const dueDays = data.due_days_from_now ?? data.Due_days_from_now;
        if (dueDays !== undefined && dueDays !== null) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + Number(dueDays));
          setDueDate(futureDate.toISOString().split("T")[0]);
        }
      }
    } catch (error) {
      console.error("Failed to generate task with AI:", error);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleStatesSelectionChange = (event) => {
    const {
      target: { value },
    } = event;
    const REQUIRED_STATES = ["UNASSIGNED", "ASSIGNED", "COMPLETED"];
    const selected = typeof value === "string" ? value.split(",") : value;
    setAllStates(Array.from(new Set([...REQUIRED_STATES, ...selected])));
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
            label="Type here to generate with AI (e.g. 'Create a React login form, 5 points, due in 3 days')"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isAiGenerating || !isTeamLead}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 1, bgcolor: "rgba(103, 58, 183, 0.05)" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    color="primary"
                    edge="end"
                    aria-label="generate-with-ai"
                  >
                    {isAiGenerating ? (
                      <CircularProgress size={20} />
                    ) : (
                      <AutoFixHighIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ borderBottom: "1px solid #eee", mb: 1 }} />
          
          <TextField
            label="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />

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
          
          <Box sx={{ p: 1.5, border: "1px solid #dcdcdc", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Workflow States
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
              {allStates.map((state) => (
                <Chip
                  key={state}
                  label={state}
                  size="small"
                  sx={{ ...stateChipSx(state), mb: 1 }}
                  onDelete={FIXED_STATES.includes(state) ? undefined : () => handleRemoveState(state)}
                />
              ))}
            </Stack>
            <FormControl fullWidth size="small">
              <InputLabel>Add Workflow State</InputLabel>
              <Select
                label="Add Workflow State"
                value=""
                onChange={(e) => handleAddState(e.target.value)}
                disabled={availableStatesToAdd.length === 0}
              >
                {availableStatesToAdd.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

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
