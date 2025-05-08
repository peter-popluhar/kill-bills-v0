import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export const Login: React.FC = () => {
  const { signInWithGoogle, user } = useAuth();

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Welcome to Kill Bills
          </Typography>
          {user ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body1">Access Denied</Typography>
              <Typography variant="body2">You are not authorized to use this application.</Typography>
            </Alert>
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={signInWithGoogle}
              sx={{ mt: 2 }}
            >
              Sign in with Google
            </Button>
          )}
        </Paper>
      </Box>
    </Container>
  );
}; 
