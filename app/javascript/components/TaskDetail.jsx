import * as React from 'react';
import dayjs from "dayjs";
import {Popover, Box, Button, Typography} from '@mui/material';

export default function TaskDetail({open, onClose, anchorEl, clickedEvent}) {
  if(!clickedEvent) return null;

  return (
    <Popover
      disableRestoreFocus
      open={open} onClose={onClose}

      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'center',
        //horizontal: dayjs(clickedEvent.start).day() <= 2 ? 'right' : 'left',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'bottom',
        //horizontal: dayjs(clickedEvent.start).day() <= 2 ? 'left' : 'right',
        horizontal: 'right',
      }}
    >
      <Box
        component="form"
        sx={{
          p: 2,
          width: 420,
          maxWidth: "90vw",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6">{clickedEvent.title}</Typography>
        <Typography>Start: {clickedEvent.start ? dayjs(clickedEvent.start).format('YYYY-MM-DD HH:mm') : 'N/A'}</Typography>
        <Typography>End: {clickedEvent.end ? dayjs(clickedEvent.end).format('YYYY-MM-DD HH:mm') : 'N/A'}</Typography>
      </Box>

    </Popover>
  )

}
