import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const STATE_COLORS = {
  UNASSIGNED: "#757575",
  ASSIGNED: "#1e88e5",
  DEVELOPMENT: "#fb8c00",
  TESTING: "#8e24aa",
  PRODUCTION: "#00897b",
  COMPLETED: "#2e7d32",
};

const mockTeamUsers = [
  { id: 1, name: "Taylor Lead", email: "lead@teamflow.dev" },
  { id: 2, name: "Riley Member", email: "member@teamflow.dev" },
  { id: 3, name: "Jordan QA", email: "qa@teamflow.dev" },
];

const mockTaskTransitionPendings = [
  {
    id: 2001,
    approved_by_id: 1,
    requested_by_id: 2,
    from_state: "ASSIGNED",
    to_state: "DEVELOPMENT",
    status: "pending",
    task_id: 1001,
    created_at: "2026-03-26T09:30:00Z",
    updated_at: "2026-03-26T09:30:00Z",
  },
  {
    id: 2002,
    approved_by_id: 1,
    requested_by_id: 3,
    from_state: "TESTING",
    to_state: "PRODUCTION",
    status: "pending",
    task_id: 1008,
    created_at: "2026-03-26T10:00:00Z",
    updated_at: "2026-03-26T10:00:00Z",
  },
  {
    id: 2003,
    approved_by_id: 1,
    requested_by_id: 2,
    from_state: "PRODUCTION",
    to_state: "COMPLETED",
    status: "approved",
    task_id: 1010,
    created_at: "2026-03-25T10:00:00Z",
    updated_at: "2026-03-25T10:05:00Z",
  },
];

function stateChip(state) {
  return (
    <Chip
      label={state}
      size="small"
      sx={{
        bgcolor: STATE_COLORS[state] || "#9e9e9e",
        color: "#fff",
        fontWeight: 700,
      }}
    />
  );
}

function RequestCard({ item, requester, onApprove, onReject }) {
  return (
    <Card sx={{ borderRadius: 2, border: "1px solid #e7e7e7" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack spacing={0.6}>
            <Typography variant="subtitle2" color="text.secondary">
              Request #{item.id} · Task #{item.task_id}
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {requester?.name || "Unknown User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {requester?.email || "unknown@example.com"}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {stateChip(item.from_state)}
            <Typography color="text.secondary">→</Typography>
            {stateChip(item.to_state)}
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <IconButton
              aria-label="approve"
              onClick={() => onApprove(item.id)}
              sx={{ color: "#2e7d32" }}
            >
              <CheckCircleIcon />
            </IconButton>
            <IconButton
              aria-label="reject"
              onClick={() => onReject(item.id)}
              sx={{ color: "#d32f2f" }}
            >
              <CancelIcon />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ValidateTasks() {
  const [pendingRequests, setPendingRequests] = useState(mockTaskTransitionPendings);

  const userById = useMemo(() => {
    const map = {};
    mockTeamUsers.forEach((user) => {
      map[user.id] = user;
    });
    return map;
  }, []);

  const visiblePending = useMemo(
    () => pendingRequests.filter((r) => r.status === "pending"),
    [pendingRequests],
  );

  const updateStatus = (requestId, status) => {
    setPendingRequests((prev) =>
      prev.map((item) =>
        item.id === requestId
          ? {
              ...item,
              status,
              updated_at: new Date().toISOString(),
            }
          : item,
      ),
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Validate Task Transitions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Admin panel: only transition requests with pending status are shown.
      </Typography>

      <Stack spacing={1.2}>
        {visiblePending.length === 0 ? (
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#f7f7f7", border: "1px dashed #c9c9c9" }}>
            <Typography color="text.secondary">No pending transition requests.</Typography>
          </Box>
        ) : (
          visiblePending.map((item) => (
            <RequestCard
              key={item.id}
              item={item}
              requester={userById[item.requested_by_id]}
              onApprove={(id) => updateStatus(id, "approved")}
              onReject={(id) => updateStatus(id, "rejected")}
            />
          ))
        )}
      </Stack>
    </Box>
  );
}
