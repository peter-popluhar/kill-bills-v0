import React, { useState } from 'react';
import { Box, Tab, Tabs, Badge, Paper } from '@mui/material';
import { OrderManagement } from './OrderManagement';
import { Archive } from './Archive';
import { useArchiveManagement } from '../hooks/useArchiveManagement';
import { SettingsThemeSwitcher } from './SettingsThemeSwitcher';
import { SettingsCurrencySwitcher } from './SettingsCurrencySwitcher';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ display: value === index ? 'block' : 'none' }}
      {...other}
    >
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </div>
  );
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface TabNavigationProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ value, onChange }) => {
  const { archivedOrders } = useArchiveManagement();

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs 
        value={value} 
        onChange={onChange}
        aria-label="basic tabs example"
        variant='fullWidth' 
        color="primary"
        centered
      >
        <Tab label="Orders" {...a11yProps(0)} />
        <Tab 
          label={
            <Badge 
              badgeContent={archivedOrders?.length || 0} 
              color="primary"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              sx={{ 
                '& .MuiBadge-badge': { 
                  display: archivedOrders?.length ? 'block' : 'none',
                  position: 'relative',
                }
              }}
            >
              Archive
            </Badge>
          } 
          {...a11yProps(1)} 
        />
        <Tab label="Settings" {...a11yProps(2)} />
      </Tabs>
    </Box>
  );
};

export const TabLayout: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TabNavigation value={value} onChange={handleChange} />
      <TabPanel value={value} index={0}>
        <OrderManagement />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Archive />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <SettingsThemeSwitcher />
        </Paper>
        <Paper sx={{ p: 3 }}>
          <SettingsCurrencySwitcher />
        </Paper>
      </TabPanel>
    </Box>
  );
};
