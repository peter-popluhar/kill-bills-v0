import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Collapse,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  TextFields as TextFieldsIcon,
  AttachMoney as AttachMoneyIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CurrencyExchange as CurrencyExchangeIcon,
} from '@mui/icons-material';
import { OrderItem as OrderItemType } from '../../types/OrderItem';

interface OrderItemComponentProps {
  item: OrderItemType;
  currency: string;
  isExpanded: boolean;
  convertedPrice?: string;
  onToggleExpand: () => void;
  onIncrementAmount: () => void;
  onDecrementAmount: () => void;
  onEditName: () => void;
  onEditPrice: () => void;
  onDelete: () => void;
}

export const OrderItemComponent: React.FC<OrderItemComponentProps> = ({
  item,
  currency,
  isExpanded,
  convertedPrice,
  onToggleExpand,
  onIncrementAmount,
  onDecrementAmount,
  onEditName,
  onEditPrice,
  onDelete
}) => {
  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 1,
        cursor: 'pointer',
        '&:hover': { backgroundColor: 'action.hover' }
      }}
      onClick={onToggleExpand}
    >
      <Stack>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">
              {item.itemName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.itemCalculatedAmount} x {item.itemInitialPrice} = {item.itemCalculatedPrice} {currency}
            </Typography>
            <Typography variant="body2" color="text.secondary">{item.currentTime}</Typography>

            {convertedPrice && (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', mt: 0.5 }}>
                <CurrencyExchangeIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                {convertedPrice}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Stack spacing={2}>
              {isExpanded ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </Stack>
          </Box>
        </Box>
        
        <Collapse in={isExpanded} timeout="auto">
          <Box onClick={(e) => e.stopPropagation()}>
            <Stack sx={{ paddingTop: '1.5rem'}} direction={{ xs: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <IconButton 
                onClick={onIncrementAmount} 
                size="small" 
                sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
              >
                <AddIcon fontSize='small'/>
              </IconButton>
              <IconButton 
                onClick={onDecrementAmount} 
                size="small" 
                sx={{ backgroundColor: 'error.main', color: 'white', '&:hover': { backgroundColor: 'error.dark' } }}
              >
                <RemoveIcon fontSize='small' />
              </IconButton>
              <IconButton 
                onClick={onEditName} 
                size="small" 
                sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
              >
                <TextFieldsIcon fontSize='small' />
              </IconButton>
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPrice();
                }} 
                size="small" 
                sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
              >
                <AttachMoneyIcon fontSize='small' />
              </IconButton>
              <IconButton 
                onClick={onDelete}
                size="small" 
                sx={{ backgroundColor: 'error.main', color: 'white', '&:hover': { backgroundColor: 'error.dark' } }}
              >
                <DeleteIcon fontSize='small' />
              </IconButton>
            </Stack>
          </Box>
        </Collapse>
      </Stack>
    </Paper>
  );
};
