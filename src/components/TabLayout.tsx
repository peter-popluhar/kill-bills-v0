import React, { useState } from 'react';
import { Box, Tab, Tabs, Badge, RadioGroup, FormControlLabel, Radio, FormLabel, FormControl } from '@mui/material';
import { OrderManagement } from './OrderManagement';
import { Archive } from './Archive';
import { useArchiveManagement } from '../hooks/useArchiveManagement';
import { useThemeMode } from '../contexts/ThemeModeContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

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
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface ToolbarProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ value, onChange }) => {
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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Toolbar value={value} onChange={handleChange} />
      <TabPanel value={value} index={0}>
        <OrderManagement />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Archive />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <SettingsThemeSwitcher />
      </TabPanel>
    </Box>
  );
};

const SettingsThemeSwitcher: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Theme</FormLabel>
      <RadioGroup
        row
        value={mode}
        onChange={e => setMode(e.target.value as 'system' | 'light' | 'dark')}
        name="theme-mode"
      >
        <FormControlLabel value="system" control={<Radio />} label="System" />
        <FormControlLabel value="light" control={<Radio />} label="Light" />
        <FormControlLabel value="dark" control={<Radio />} label="Dark" />
      </RadioGroup>
    </FormControl>
  );
}; 
