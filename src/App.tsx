import React from 'react';
import { TabLayout } from './components/TabLayout';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';

function App() {
  const { user, logout, isAuthorized } = useAuth();

  if (!user || !isAuthorized) {
    return <Login />;
  }

  return (
    <>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Kill Bills
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              Welcome, {user.email}
            </Typography>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <TabLayout />
      </Container>
    </>
  );
}

export default App;
