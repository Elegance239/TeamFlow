import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useSnackbar } from "notistack";

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
  const { enqueueSnackbar } = useSnackbar();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingRequests = async () => {
    const response = await fetch("/task_transition_pendings", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      let message = "Failed to load pending requests";
      try {
        const data = await response.json();
        message = data?.error || data?.errors?.join(", ") || message;
      } catch (error) {
        // Keep fallback message when response body is not JSON.
      }
      throw new Error(message);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  const fetchTeamUsers = async (teamId) => {
    if (!teamId) return [];

    const response = await fetch(`/teams/${teamId}/members`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
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
            const members = await fetchTeamUsers(mergedUser.team_id);
            if (alive) setTeamUsers(members);
          }
        }

        const requests = await fetchPendingRequests();
        if (alive) setPendingRequests(requests);
      } catch (error) {
        if (alive) {
          setPendingRequests([]);
          enqueueSnackbar(error.message || "Failed to load validation queue", { variant: "error" });
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

  const userById = useMemo(() => {
    const map = {};
    teamUsers.forEach((user) => {
      map[user.id] = user;
    });
    return map;
  }, [teamUsers]);

  const visiblePending = useMemo(
    () => pendingRequests.filter((r) => r.status === "pending"),
    [pendingRequests],
  );

  const updateStatus = async (requestId, status) => {
    const endpoint = status === "approved" ? "approve" : "reject";

    try {
      const response = await fetch(`/task_transition_pendings/${requestId}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        let message = `Failed to ${endpoint} request`;
        try {
          const data = await response.json();
          message = data?.error || data?.errors?.join(", ") || message;
        } catch (error) {
          // Keep fallback message when response body is not JSON.
        }
        enqueueSnackbar(message, { variant: "error" });
        return;
      }

      setPendingRequests((prev) => prev.filter((item) => item.id !== requestId));
      enqueueSnackbar(`Request ${status}`, { variant: "success" });
    } catch (error) {
      enqueueSnackbar(`Network error while trying to ${endpoint} request`, { variant: "error" });
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      {isLoading && <LinearProgress sx={{ mb: 1 }} />}
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
