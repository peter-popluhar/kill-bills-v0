import React from 'react';
import { Toolbar, Box, Typography, Chip, Avatar, Button } from '@mui/material';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <Toolbar>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%' }}>
        <Typography variant="h5" component="h1">
          KillBill&#x24;
        </Typography>
        <Chip
          sx={{ backgroundColor: '#e0e0e0' }}
          variant="outlined"
          avatar={<Avatar alt={user.displayName || ''} src={user.photoURL || undefined} />}
          label={user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
        />
        <Button color="inherit" onClick={onLogout}>
          Logout
        </Button>
      </Box>
    </Toolbar>
  );
}; 
