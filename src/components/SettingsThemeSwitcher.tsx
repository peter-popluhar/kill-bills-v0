import React from 'react';
import { RadioGroup, FormControlLabel, Radio, FormLabel, FormControl } from '@mui/material';
import { useThemeMode } from '../contexts/ThemeModeContext';

export const SettingsThemeSwitcher: React.FC = () => {
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
        <FormControlLabel value="light" control={<Radio />} label="Light" />
        <FormControlLabel value="dark" control={<Radio />} label="Dark" />
        <FormControlLabel value="system" control={<Radio />} label="System" />
      </RadioGroup>
    </FormControl>
  );
};
