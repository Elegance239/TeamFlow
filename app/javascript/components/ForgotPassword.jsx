import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';

function ForgotPassword({ open, handleClose }) {
  const [email, setEmail] = React.useState('');
  const [submitError, setSubmitError] = React.useState('');
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await fetch('/users/password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content
        },
        body: JSON.stringify({ user: { email } })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setSubmitError('');
    setSubmitSuccess(false);
    setIsLoading(false);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      slotProps={{
        paper: {
          sx: { backgroundImage: 'none' },
        },
      }}
    >

      <DialogTitle>Reset password</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText>
          Enter your account&apos;s email address, and we&apos;ll send you a link to
          reset your password.
        </DialogContentText>
        <OutlinedInput
          autoFocus
          required
          margin="dense"
          id="email"
          name="email"
          label="Email address"
          placeholder="Email address"
          type="email"
          fullWidth
          disabled={submitSuccess}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {submitError && (
          <Typography color="error" variant="body2">
            {submitError}
          </Typography>
        )}
        {submitSuccess && (
          <Typography color="success.main" variant="body2">
            Password reset email sent! Please check your inbox.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button type="button" onClick={handleDialogClose}>Cancel</Button>
        <Button type="button" variant="contained" onClick={handleSubmit} disabled={isLoading || submitSuccess}>
          {isLoading ? 'Sending...' : 'Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;
