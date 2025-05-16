import React from 'react';
import { RadioGroup, FormControlLabel, Radio, FormLabel, FormControl } from '@mui/material';
import { useCurrency } from '../contexts/CurrencyContext';

export const SettingsCurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Currency</FormLabel>
      <RadioGroup
        row
        value={currency}
        onChange={e => setCurrency(e.target.value as 'CZK' | 'EUR')}
        name="currency-mode"
      >
        <FormControlLabel value="CZK" control={<Radio />} label="CZK" />
        <FormControlLabel value="EUR" control={<Radio />} label="EUR" />
      </RadioGroup>
    </FormControl>
  );
};
