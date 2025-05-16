import React from 'react';
import {
  Box,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface AddItemFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  itemsExist: boolean;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({ onSubmit, itemsExist }) => {

  return (
    
    <form onSubmit={onSubmit}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 'calc(33.33% - 16px)' } }}>
          <TextField
            fullWidth
            name="itemName"
            label="Item Name"
            required
            size="small"
            variant='standard'
          />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: { xs: 'calc(25% - 16px)' } }}>
          <TextField
            fullWidth
            name="itemInitialPrice"
            label="Price"
            required
            size="small"
            variant='standard'
            inputMode="decimal"
            type='numeric'
          />
        </Box>
        <Box>
          <IconButton
            type="submit"
            color="primary"
            size="large"
            aria-label="Add Item"
            sx={{backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
          >
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Box>
        {!itemsExist && (
          <Box sx={{ flexGrow: 1, minWidth: { xs: '100%'} }}>
            <Typography component="h3" color="inherit">Enter some item&#x24;</Typography>
          </Box>
        )}
      </Box>
    </form>
  );
};
