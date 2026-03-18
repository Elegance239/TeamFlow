import React, { useState } from "react";
import { Avatar, Divider, Switch, TextField, Button, Box, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

export default function Settings() {
  const [user, setUser] = useState({
    // Mock Data (Eventually this comes from GET /users/:id)
    name: "Chris Wong",
    role: "Developer",
    skills: ["React", "JavaScript", "CSS", "UI Design"],
  });
  const [emailAlerts, setEmailAlerts] = useState(false);
  return (
    <div className="settings-container" style={{ padding: '0 20px' }}>
      <h1 style={{ marginTop: 0, paddingTop: '0px' }}>Account Settings</h1>
      <Divider sx={{ my: 2 }} /> 

      {/* Profile Info */}
      <section className="profile-section">
      <h2>My Profile</h2>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
        {/* Avatar */}
        {/* Using Random avartar for testing */}
        <Avatar 
          src="https://i.pravatar.cc/" 
          sx={{ width: 100, height: 100, border: '1px solid #ddd' }}
        />

        {/* Button & Note Column */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          height: 100
        }}>
          
          {/* Buttons Row */}
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              sx={{ 
                bgcolor: '#e0e0e0', 
                color: '#424242', 
                textTransform: 'none',
                '&:hover': { bgcolor: '#d5d5d5' }
              }}
              onClick={() => alert("Upload Logic coming soon!")}
            >
              Change Avatar
            </Button>

            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: '#ff4d4d', 
                color: 'white', 
                textTransform: 'none',
                '&:hover': { bgcolor: '#e60000' }
              }}
              onClick={() => alert("Remove Logic coming soon!")}
            >
              Remove Avatar
            </Button>
          </Box>

          {/* Note */}
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Supports PNGs and JPEGs under 2MB
          </Typography>
        </Box>
      </Box>

      {/* Name and Role Boxes */}
      <Box sx={{ display: 'flex', gap: 4, mt: 4, maxWidth: '600px' }}>
        
        {/* Left Column: Name */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Name
          </Typography>
          <TextField 
            fullWidth
            variant="outlined"
            value={user.name}
            size="small"
            /* Changing 'disabled' to true will make it read-only (we can discuss abt that later)*/
            disabled={true} 
            sx={{ 
              bgcolor: '#333',
              borderRadius: '4px',
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#ffffff',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#555',
              }
            }}
          />
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
            disabled={false} 
            sx={{ 
              bgcolor: '#333',
              borderRadius: '4px',
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#ffffff',
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
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
            Email
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField 
              value="chris.wong@example.com" // eventually be {user.email}
              fullWidth
              size="small"
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{ 
                bgcolor: '#333',
                borderRadius: '4px',
                maxWidth: '400px',
                '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#ffffff',
                },
                input: { color: 'white' },
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
                minWidth: '150px',
                '&:hover': { bgcolor: '#d5d5d5' }
              }}
              onClick={() => alert("Change Email logic coming soon!")}
            >
              Change Email
            </Button>
          </Box>
        </Box>

        {/* 2. Password Row */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
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
                bgcolor: '#333', 
                borderRadius: '4px',
                maxWidth: '400px',
                '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#ffffff',
                },
                input: { color: 'white' },
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
              onClick={() => alert("Change Password logic coming soon!")}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0px', marginBottom: '0px' }}>
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
                bgcolor: '#333',
                borderRadius: '4px',
                maxWidth: '400px',
                '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#ffffff',
                },
                input: { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
              }}
        />
      </section>

      <Divider sx={{ my: 2 }} />
      {/* Skill Tags */}
      <section className="skills-section">
        <h2>My Skills</h2>
        <div className="tag-container">
          {user.skills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
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
          onClick={() => alert("Logout logic coming soon!")}
        >
          Log Out
        </Button>
      </section>
    </div>
  );
}
