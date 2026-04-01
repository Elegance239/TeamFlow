import React, { useEffect, useState } from "react";
import {
  Avatar,
  Divider,
  Switch,
  TextField,
  Button,
  Box,
  Typography,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("teamflowCurrentUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function ChangeDialog({ open, setOpen, target, currentUser, setCurrentUser }) {
  const handleClose = () => {
    setOpen(false);
  };

  const makeChange = {
    name: { text: "Name", type: "text", reminder: "" },
    email: { text: "Email Address", type: "email", reminder: "" },
    password: {
      text: "Password",
      type: "password",
      reminder: "At least 6 characters",
    },
    skills: {
      text: "Skills",
      type: "text",
      reminder:
        " Use commas to sperate your skills (example: css,react,javascript)",
    },
  };

  const config = makeChange[target];
  if (!config) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());

    let payload = {};

    if (target === "name") {
      payload = {
        name: formJson.name,
      };
    } else if (target === "email") {
      payload = {
        email: formJson.email,
      };
    } else if (target === "skills") {
      payload = {
        skills: formJson.skills,
      };
    } else if (target === "password") {
      if (formJson.password !== formJson.password_confirmation) {
        alert("Passwords do not match");
        return;
      }

      payload = {
        password: formJson.password,
        password_confirmation: formJson.password_confirmation,
      };
    }

    try {
      const response = await fetch(`/users/${currentUser.id}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data?.errors?.join(", ") || "Update failed");
        return;
      }

      const updatedUser = {
        ...currentUser,
        ...data,
      };

      localStorage.setItem("teamflowCurrentUser", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      handleClose();
    } catch (error) {
      console.error(error);
      alert("Network error while updating");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        "& .MuiDialog-paper": {
          minWidth: 420,
        },
      }}
    >
      <DialogTitle>Change {config.text}</DialogTitle>
      <DialogContent>
        <DialogContentText>{config.reminder}</DialogContentText>
        <Box
          component="form"
          onSubmit={handleSubmit}
          id="change-form"
          sx={{ mt: 1 }}
        >
          {target === "password" ? (
            <>
              <TextField
                autoFocus
                required
                margin="dense"
                name="password"
                label="New Password"
                type="password"
                fullWidth
                variant="standard"
              />
              <TextField
                required
                margin="dense"
                name="password_confirmation"
                label="Confirm Password"
                type="password"
                fullWidth
                variant="standard"
              />
            </>
          ) : (
            <TextField
              autoFocus
              required
              margin="dense"
              name={target}
              label={config.text}
              type={config.type}
              fullWidth
              variant="standard"
              defaultValue={
                target === "email"
                  ? currentUser.email || ""
                  : target === "skills"
                    ? currentUser.skills || ""
                    : ""
              }
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="change-form">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Settings() {
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  const handleLogoutClick = async () => {
    try {
      await fetch("/users/sign_out", {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (error) {
      // Local logout still proceeds if network call fails.
    }

    localStorage.removeItem("teamflowCurrentUser");
    window.location.href = "/";
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
      } catch (error) {
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      alive = false;
    };
  }, []);

  const safeCurrentUser = currentUser || {
    id: null,
    name: "Unknown User",
    email: "unknown@example.com",
    role: "team_member",
    skills: "",
    team_id: null,
  };

  const skillList = String(safeCurrentUser.skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const displaySkills = skillList.length > 0 ? skillList : ["unknown"];
  const displayRole =
    safeCurrentUser.role === "team_lead" ? "Team Lead" : "Team Member";

  const [open, setOpen] = useState(false);
  const handleClickOpen = (t) => {
    setChangeTarget(t);
    setOpen(true);
  };
  const [changeTarget, setChangeTarget] = useState("email");

  return (
    <div className="settings-container" style={{ padding: "0 20px" }}>
      {isLoading && <LinearProgress sx={{ mb: 1 }} />}
      <h1 style={{ marginTop: 0, paddingTop: "0px" }}>Account Settings</h1>
      <Divider sx={{ my: 2 }} />

      {/* Profile Info */}
      <section className="profile-section">
        <h2>My Profile</h2>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
          {/* Avatar */}
          {/* Using Random avartar for testing */}
          <Avatar
            src="https://i.pravatar.cc/"
            sx={{ width: 100, height: 100, border: "1px solid #ddd" }}
          />
          {/* 
          
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: 100,
            }}
          >
            
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: "#e0e0e0",
                  color: "#424242",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#d5d5d5" },
                }}
                onClick={() => alert("Upload Logic coming soon!")}
              >
                Change Avatar
              </Button>

              <Button
                variant="contained"
                sx={{
                  bgcolor: "#ff4d4d",
                  color: "white",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#e60000" },
                }}
                onClick={() => alert("Remove Logic coming soon!")}
              >
                Remove Avatar
              </Button>
            </Box>

            
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              Supports PNGs and JPEGs under 2MB
            </Typography>
          </Box> */}
        </Box>

        {/* Column: Name */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
            Name
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              fullWidth
              variant="outlined"
              value={safeCurrentUser.name}
              size="small"
              /* Changing 'disabled' to true will make it read-only (we can discuss abt that later)*/
              disabled={true}
              sx={{
                borderRadius: "4px",
                maxWidth: "400px",
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "inherit",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#555",
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: "#e0e0e0",
                color: "#424242",
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "#d5d5d5" },
                minWidth: "150px",
              }}
              onClick={() => handleClickOpen("name")}
            >
              Change Name
            </Button>
          </Box>
        </Box>

        {/* Column: Role */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
            Role
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={displayRole}
            size="small"
            disabled={true}
            sx={{
              bgcolor: "inherit",
              maxWidth: "400px",
              borderRadius: "4px",
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "inherit",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#555",
              },
            }}
          />
        </Box>
      </section>

      <Divider sx={{ my: 2 }} />
      {/* Account Security */}
      <section className="security-section">
        <h2>Account Security</h2>
        {/* 1. Email Row */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", mb: 1, color: "inherit" }}
          >
            Email
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              value={safeCurrentUser.email}
              fullWidth
              size="small"
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{
                bgcolor: "inherit",
                borderRadius: "4px",
                maxWidth: "400px",
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "inherit",
                },
                input: { color: "inherit" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: "#e0e0e0",
                color: "#424242",
                textTransform: "none",
                whiteSpace: "nowrap",
                minWidth: "150px",
                "&:hover": { bgcolor: "#d5d5d5" },
              }}
              onClick={() => handleClickOpen("email")}
            >
              Change Email
            </Button>
          </Box>
        </Box>

        {/* 2. Password Row */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", mb: 1, color: "inherit" }}
          >
            Password
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              value="password123"
              type="password"
              fullWidth
              size="small"
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{
                bgcolor: "inherit",
                borderRadius: "4px",
                maxWidth: "400px",
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#inherit",
                },
                input: { color: "inherit" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: "#e0e0e0",
                color: "#424242",
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "#d5d5d5" },
                minWidth: "150px",
              }}
              onClick={() => handleClickOpen("password")}
            >
              Change Password
            </Button>
          </Box>
        </Box>
      </section>

      <Divider sx={{ my: 2 }} />
      {/* Email Alerts */}
      <section className="alerts-section">
        <h2>System Alerts</h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0px",
            marginBottom: "0px",
          }}
        >
          <span>Enable Email Notifications</span>
          <Switch
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
          />
        </div>
        <TextField
          label="Alert Email"
          variant="outlined"
          size="small"
          disabled={!emailAlerts}
          placeholder="Enter email for new tasks/deadlines"
          fullWidth
          sx={{
            bgcolor: "inherit",
            borderRadius: "4px",
            maxWidth: "400px",
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "inherit",
            },
            input: { color: "white" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
          }}
        />
      </section>

      <Divider sx={{ my: 2 }} />
      {/* Skill Tags */}
      <section className="skills-section">
        <h2>My Skills</h2>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            p: 1,
          }}
        >
          <div className="tag-container">
            {displaySkills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#e0e0e0",
              color: "#424242",
              textTransform: "none",
              "&:hover": { bgcolor: "#d5d5d5" },
            }}
            onClick={() => handleClickOpen("skills")}
          >
            Change Skills
          </Button>
        </Box>
      </section>

      {/* Logout */}
      <section className="danger-zone" style={{ marginTop: "20px" }}>
        <Divider sx={{ mb: 2 }} />
        <Button
          className="logout-button"
          sx={{
            bgcolor: "#ff4d4d",
            color: "white",
            textTransform: "none",
            "&:hover": { bgcolor: "#e60000" },
          }}
          onClick={handleLogoutClick}
        >
          Log Out
        </Button>
      </section>
      <ChangeDialog
        open={open}
        setOpen={setOpen}
        target={changeTarget}
        currentUser={safeCurrentUser}
        setCurrentUser={setCurrentUser}
      />
    </div>
  );
}
