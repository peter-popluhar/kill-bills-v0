import React from 'react';
import { AppBar, Box, Container } from '@mui/material';
import { TabLayout } from './components/TabLayout';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Header } from './components/Header';

export const App: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Header user={user} onLogout={logout} />
      </AppBar>
      <Container maxWidth="lg">
        <TabLayout />
      </Container>
    </Box>
  );
};

export default App;
