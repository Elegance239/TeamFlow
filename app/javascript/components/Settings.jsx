import React, { useState, useEffect } from "react";
import { Avatar, Divider, Switch, TextField, Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { getCsrfHeaders } from "../utils/csrf";


export default function Settings({ user: currentUser, setUser, setAuth }) {
  const getAlertsStorageKey = (userId) => `teamflowEmailAlerts:${userId}`;

  const saveAlertsPreference = (userId, enabled, email) => {
    if (!userId) return;
    localStorage.setItem(
      getAlertsStorageKey(userId),
      JSON.stringify({ enabled, email })
    );
  };

  const [user, setLocalUser] = useState(null);
  const [nameEdit, setNameEdit] = useState('');
  const [skillsEdit, setSkillsEdit] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [skillsSaved, setSkillsSaved] = useState(false);
  
  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`/users/${currentUser.id}`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        setLocalUser(data);
        setNameEdit(data.name || '');
        setSkillsEdit(data.skills || '');

        const stored = localStorage.getItem(getAlertsStorageKey(data.id));
        const parsed = stored ? JSON.parse(stored) : null;
        const savedEnabled = Boolean(parsed?.enabled);
        const savedEmail = parsed?.email || data.email || '';

        setEmailAlerts(savedEnabled);
        setAlertEmail(savedEmail);
      });
  }, [currentUser]);

  const handleSaveName = async () => {
    const res = await fetch(`/users/${user.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getCsrfHeaders()
      },
      body: JSON.stringify({ name: nameEdit })
    });

    const data = await res.json();
    if (res.ok) {
      setLocalUser(prev => ({ ...prev, name: data.name }));
      setUser(prev => ({ ...prev, name: data.name }));
      localStorage.setItem('teamflowCurrentUser', JSON.stringify({ ...currentUser, name: data.name }));
      alert('Name updated successfully!');
    } else {
      alert(data.errors?.join(', ') || 'Failed to update name.');
    }
  };

  const handleSaveSkills = async () => {
    const res = await fetch(`/users/${user.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getCsrfHeaders()
      },
      body: JSON.stringify({ skills: skillsEdit })
    });
    const data = await res.json();
    if (res.ok) {
      setLocalUser(prev => ({ ...prev, skills: data.skills }));
      setSkillsSaved(true);
      setTimeout(() => setSkillsSaved(false), 3000);
    } else {
      alert(data.errors?.join(', ') || 'Failed to update skills.');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    const res = await fetch('/users/password/change', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getCsrfHeaders()
      },
      body: JSON.stringify({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      })
    });

    const data = await res.json();
    if (res.ok) {
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(data.error || data.errors?.join(', ') || 'Failed to change password.');
    }
  };

  const handleLogout = async () => {
    await fetch('/users/sign_out', {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        ...getCsrfHeaders()
      }
    });
    localStorage.removeItem('teamflowCurrentUser');
    setAuth(false);
    setUser(null);
  };

  if (!user) return <Typography sx={{ p: 3 }}>Loading...</Typography>;
  return (
    <div className="settings-container" style={{ padding: '0 20px' }}>
      <h1 style={{ marginTop: 0, paddingTop: '0px' }}>Account Settings</h1>
      <Divider sx={{ my: 2 }} /> 

      {/* Profile Info */}
      <section className="profile-section">
      <h2>My Profile</h2>
      

      {/* Name and Role Boxes */}
      <Box sx={{ display: 'flex', gap: 4, mt: 4, maxWidth: '900px' }}>
        
        {/* Left Column: Name */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>Name</Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={nameEdit}
            size="small"
            slotProps={{
                input: {
                  readOnly: true,
                },
              }} 
            onChange={(e) => setNameEdit(e.target.value)}
            sx={{ 
              borderRadius: '4px',
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'inherit',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#555',
              }
            }}
          />
          {/* <Button
            variant="contained"
            size="small"
            sx={{ mt: 1, textTransform: 'none' }}
            onClick={handleSaveName}
          >
            Save Name
          </Button> */}
        </Box>
            

        {/* Right Column: Role */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Role
          </Typography>
          <TextField 
            fullWidth
            variant="outlined"
            value={user.role}
            size="small"
            slotProps={{
                input: {
                  readOnly: true,
                },
              }} 
            sx={{ 
              bgcolor: 'inherit',
              borderRadius: '4px',
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'inherit',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#555',
              }
            }}
          />
        </Box>

        {/* Right Column: User ID (new) */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              User ID
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={user.id}
              size="small"
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{
                bgcolor: 'inherit',
                borderRadius: '4px',
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: 'inherit',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#555',
                }
              }}
            />
          </Box>
      </Box>

    </section>

      <Divider sx={{ my: 2 }} />
      {/* Account Security */}
      <section className="security-section">
        <h2>Account Security</h2>
        {/* 1. Email Row */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: 'inherit' }}>
            Email
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField 
              value={user.email} // eventually be {user.email}
              fullWidth
              size="small"
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{ 
                bgcolor: 'inherit',
                borderRadius: '4px',
                maxWidth: '400px',
                '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'inherit',
                },
                input: { color: 'inherit' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
              }}
            />
            {/* <Button 
              variant="contained" 
              sx={{ 
                bgcolor: '#e0e0e0', 
                color: '#424242', 
                textTransform: 'none',
                whiteSpace: 'nowrap', 
                minWidth: '150px',
                '&:hover': { bgcolor: '#d5d5d5' }
              }}
              onClick={() => alert("Change Email logic coming soon!")}
            >
              Change Email
            </Button> */}
          </Box>
        </Box>

        {/* 2. Password Row */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: 'inherit' }}>
            Password
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                bgcolor: 'inherit', 
                borderRadius: '4px',
                maxWidth: '400px',
                '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#inherit',
                },
                input: { color: 'inherit' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
              }}
            />
            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: '#e0e0e0', 
                color: '#424242', 
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#d5d5d5' },
                minWidth: '150px'
              }}
              onClick={() => setPasswordOpen(true)}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0px', marginBottom: '8px' }}>
          <span>Enable Email Notifications</span>
          <Switch
            checked={emailAlerts}
            onChange={(e) => {
              const enabled = e.target.checked;
              setEmailAlerts(enabled);
              saveAlertsPreference(user.id, enabled, alertEmail);
            }}
          />
        </div>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Alert Email"
            variant="outlined"
            size="small"
            disabled={!emailAlerts}
            value={alertEmail}
            onChange={(e) => setAlertEmail(e.target.value)}
            fullWidth
            sx={{ 
                bgcolor: 'inherit',
                borderRadius: '4px',
                maxWidth: '400px',
                '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'inherit',
                },
                input: { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
              }}
          />
          <Button
            variant="contained"
            size="small"
            disabled={!emailAlerts}
            sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            onClick={() => {
              saveAlertsPreference(user.id, emailAlerts, alertEmail);
              alert('Alert email saved!');
            }}
          >
            Save
          </Button>
        </Box>
      </section>

      <Divider sx={{ my: 2 }} />
      {/* Skill Tags */}
      <section className="skills-section">
        <h2>My Skills</h2>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
          Enter skills as comma-separated values e.g. html,css,js
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          value={skillsEdit}
          size="small"
          onChange={(e) => setSkillsEdit(e.target.value)}
          sx={{ maxWidth: '400px' }}
        />
        <Button
          variant="contained"
          size="small"
          sx={{ mt: 1, textTransform: 'none', display: 'block' }}
          onClick={handleSaveSkills}
        >
          Save Skills
        </Button>
        {skillsSaved && (
          <Typography variant="caption" sx={{ color: 'success.main', mt: 1, display: 'block' }}>
            Skills updated successfully!
          </Typography>
        )}

        {/* Show saved skills as tags */}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {user.skills
            ? user.skills.split(',').filter(s => s.trim()).map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill.trim()}
                </span>
              ))
            : <Typography variant="caption" sx={{ color: 'text.secondary' }}>No skills added yet.</Typography>
          }
        </Box>
      </section>

      {/* Logout */}
      <section className="danger-zone" style={{ marginTop: '20px' }}>
        <Divider sx={{ mb: 2 }} />
        <Button
          className="logout-button"
          sx={{ 
                bgcolor: '#ff4d4d', 
                color: 'white', 
                textTransform: 'none',
                '&:hover': { bgcolor: '#e60000' }
              }}
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </section>

       {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onClose={() => setPasswordOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, minWidth: 400 }}>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            size="small"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            size="small"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && <Typography color="error" variant="body2">{passwordError}</Typography>}
          {passwordSuccess && <Typography color="success.main" variant="body2">{passwordSuccess}</Typography>}
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button type="button" onClick={() => setPasswordOpen(false)}>Cancel</Button>
          <Button type="button" variant="contained" onClick={handleChangePassword}>
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}