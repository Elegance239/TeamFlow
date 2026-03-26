import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Link from '@mui/material/Link';
import Radio from '@mui/material/Radio';
import Divider from '@mui/material/Divider';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import { getCsrfHeaders } from '../utils/csrf';

// This is just styling stuff straight from MUI

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  maxWidth: '450px',
  height: '70vh',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

const ScrollableForm = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export default function SignUp(props) {
  const onNavigate = props.onNavigate;
  const [submitError, setSubmitError] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');
  const [teamNameError, setTeamNameError] = React.useState(false);
  const [teamNameErrorMessage, setTeamNameErrorMessage] = React.useState('');
  const [roleError, setRoleError] = React.useState(false);
  const [roleErrorMessage, setRoleErrorMessage] = React.useState('');
  const [deptNameError, setDeptNameError] = React.useState(false);
  const [deptNameErrorMessage, setDeptNameErrorMessage] = React.useState('');
  const [deptCodeError, setDeptCodeError] = React.useState(false);
  const [deptCodeErrorMessage, setDeptCodeErrorMessage] = React.useState('');
  const [adminDeptOption, setAdminDeptOption] = React.useState('new');
  const [adminDeptNameError, setAdminDeptNameError] = React.useState(false);
  const [adminDeptNameErrorMessage, setAdminDeptNameErrorMessage] = React.useState('');
  const [adminDeptCodeError, setAdminDeptCodeError] = React.useState(false);
  const [adminDeptCodeErrorMessage, setAdminDeptCodeErrorMessage] = React.useState('');

  const [role, setRole] = React.useState('user');

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    setRole(newRole);

    if (newRole === 'admin') {
      setAdminDeptOption('new');
      setAdminDeptNameError(false);
      setAdminDeptNameErrorMessage('');
      setAdminDeptCodeError(false);
      setAdminDeptCodeErrorMessage('');
      setDeptCodeError(false);
      setDeptCodeErrorMessage('');
    } else {
      setDeptNameError(false);
      setDeptNameErrorMessage('');
    }
  };

  const validateInputs = () => {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const teamName = document.getElementById('teamName');

    let isValid = true;

    if (!name.value || /[^a-zA-Z\s]+/.test(name.value)) {
      setNameError(true);
      setNameErrorMessage('Please enter a valid name.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!confirmPassword.value || confirmPassword.value !== password.value) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Passwords do not match.');
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }

    if (!teamName.value || !teamName.value.trim()) {
      setTeamNameError(true);
      setTeamNameErrorMessage('Please enter a team name.');
      isValid = false;
    } else {
      setTeamNameError(false);
      setTeamNameErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const name = data.get('name');
    const email = data.get('email');
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');
    const teamName = data.get('teamName');

    try {
      const response = await fetch('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...getCsrfHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          user: {
            name,
            email,
            password,
            password_confirmation: confirmPassword,
            team_name: teamName,
          },
        }),
      });

      if (response.ok) {
        setSubmitError('');
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('confirmPassword').value = '';
        document.getElementById('teamName').value = '';
        onNavigate('signin');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || (errorData.errors && errorData.errors.join(', ')) || 'Sign up failed. Please try again.';
        setSubmitError(message);
      }
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
      console.error('Sign up error:', error);
    }
  };

  // This is just reusing the SignIn themes, fields and stuff
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign Up
          </Typography>

          <ScrollableForm>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
            >

              <FormControl>
                <FormLabel htmlFor="name">Display Name</FormLabel>
                <TextField
                  error={nameError}
                  helperText={nameErrorMessage}
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Chris Wong"
                  autoComplete="name"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={emailError ? 'error' : 'primary'}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                  error={emailError}
                  helperText={emailErrorMessage}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={emailError ? 'error' : 'primary'}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="password">Password</FormLabel>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  required
                  fullWidth
                  variant="outlined"
                  color={passwordError ? 'error' : 'primary'}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                <TextField
                  error={confirmPasswordError}
                  helperText={confirmPasswordErrorMessage}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••"
                  type="password"
                  required
                  fullWidth
                  variant="outlined"
                  color={confirmPasswordError ? 'error' : 'primary'}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="teamName">Team Name</FormLabel>
                <TextField
                  error={teamNameError}
                  helperText={teamNameErrorMessage}
                  id="teamName"
                  name="teamName"
                  placeholder="e.g. Platform Team"
                  required
                  fullWidth
                  variant="outlined"
                  color={teamNameError ? 'error' : 'primary'}
                />
              </FormControl>

              <FormControl error={roleError}>
                <FormLabel component="legend">Register as</FormLabel>
                <RadioGroup
                  row
                  name="role"
                  value={role}
                  onChange={handleRoleChange}
                >
                  <FormControlLabel value="user" control={<Radio />} label="User" />
                  <FormControlLabel value="admin" control={<Radio />} label="Admin" />
                </RadioGroup>
                <FormHelperText>{roleErrorMessage}</FormHelperText>
              </FormControl>

              {role === 'admin' && (
                <>
                  <FormControl>
                    <FormLabel component="legend">Department option</FormLabel>
                    <RadioGroup
                      row
                      value={adminDeptOption}
                      onChange={(e) => setAdminDeptOption(e.target.value)}
                    >
                      <FormControlLabel value="new" control={<Radio />} label="Create new department" />
                      <FormControlLabel value="existing" control={<Radio />} label="Join existing department" />
                    </RadioGroup>
                  </FormControl>

                  {adminDeptOption === 'new' && (
                    <FormControl>
                      <FormLabel htmlFor="adminDeptName">Department Name</FormLabel>
                      <TextField
                        error={adminDeptNameError}
                        helperText={adminDeptNameErrorMessage}
                        id="adminDeptName"
                        name="adminDeptName"
                        placeholder="e.g. Logistics"
                        required
                        fullWidth
                        variant="outlined"
                        color={adminDeptNameError ? 'error' : 'primary'}
                      />
                    </FormControl>
                  )}

                  {adminDeptOption === 'existing' && (
                    <FormControl>
                      <FormLabel htmlFor="adminDeptCode">Department ID</FormLabel>
                      <TextField
                        error={adminDeptCodeError}
                        helperText={adminDeptCodeErrorMessage}
                        id="adminDeptCode"
                        name="adminDeptCode"
                        placeholder="e.g. DEPT-123456"
                        required
                        fullWidth
                        variant="outlined"
                        color={adminDeptCodeError ? 'error' : 'primary'}
                      />
                    </FormControl>
                  )}
                </>
              )}

              {role === 'user' && (
                <FormControl>
                  <FormLabel htmlFor="departmentCode">Department Code ID</FormLabel>
                  <TextField
                    error={deptCodeError}
                    helperText={deptCodeErrorMessage}
                    id="departmentCode"
                    name="departmentCode"
                    placeholder="e.g. DEPT-helloworld"
                    required
                    fullWidth
                    variant="outlined"
                  />
                </FormControl>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                onClick={validateInputs}
              >
                Sign Up
              </Button>
              {submitError && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {submitError}
                </Typography>
              )}
            </Box>
          </ScrollableForm>

          <Divider>or</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              Already have an account?{' '}
              <Link component="button" variant="body2" sx={{ alignSelf: 'center' }} onClick={() => onNavigate('signin')}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}