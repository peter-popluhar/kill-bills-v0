import React from 'react';
import {
  Modal,
  Box,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogTitle
} from '@mui/material';

interface ModalComponentProps {
  nameModalOpen: boolean;
  nameInput: string;
  priceModalOpen: boolean;
  priceInput: string;
  locationModalOpen: boolean;
  locationInput: string;
  archiveSuccessOpen: boolean;
  currency: string;
  onNameInputChange: (value: string) => void;
  onPriceInputChange: (value: string) => void;
  onLocationInputChange: (value: string) => void;
  onNameModalClose: () => void;
  onPriceModalClose: () => void;
  onLocationModalClose: () => void;
  onNameModalSubmit: () => void;
  onPriceModalSubmit: () => void;
  onLocationModalSubmit: () => void;
  onArchiveSuccessClose: () => void;
}

export const ModalComponents: React.FC<ModalComponentProps> = ({
  nameModalOpen,
  nameInput,
  priceModalOpen,
  priceInput,
  locationModalOpen,
  locationInput,
  archiveSuccessOpen,
  currency,
  onNameInputChange,
  onPriceInputChange,
  onLocationInputChange,
  onNameModalClose,
  onPriceModalClose,
  onLocationModalClose,
  onNameModalSubmit,
  onPriceModalSubmit,
  onLocationModalSubmit,
  onArchiveSuccessClose
}) => {
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    minWidth: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  return (
    <>
      {/* Modal for editing item name */}
      <Modal open={nameModalOpen} onClose={onNameModalClose}>
        <Box sx={modalStyle}>
          <TextField
            label="Item Name"
            value={nameInput}
            onChange={(e) => onNameInputChange(e.target.value)}
            autoFocus
            sx={{ mb: 2, width: '100%' }}
          />
          <Button
            variant="contained"
            onClick={onNameModalSubmit}
            sx={{ alignSelf: 'center' }}
          >
            OK
          </Button>
        </Box>
      </Modal>

      {/* Modal for editing price */}
      <Modal open={priceModalOpen} onClose={onPriceModalClose}>
        <Box sx={modalStyle}>
          <TextField
            label="Price"
            type="number"
            value={priceInput}
            onChange={(e) => onPriceInputChange(e.target.value)}
            autoFocus
            InputProps={{
              endAdornment: <Typography variant="body2">{currency}</Typography>
            }}
            sx={{ mb: 2, width: '100%' }}
          />
          <Button
            variant="contained"
            onClick={onPriceModalSubmit}
            sx={{ alignSelf: 'center' }}
          >
            OK
          </Button>
        </Box>
      </Modal>

      {/* Modal for editing location */}
      <Modal open={locationModalOpen} onClose={onLocationModalClose}>
        <Box sx={modalStyle}>
          <TextField
            label="Location"
            value={locationInput}
            onChange={(e) => onLocationInputChange(e.target.value)}
            autoFocus
            sx={{ mb: 2, width: '100%' }}
          />
          <Button
            variant="contained"
            onClick={onLocationModalSubmit}
            sx={{ alignSelf: 'center' }}
          >
            OK
          </Button>
        </Box>
      </Modal>

      {/* Archive Success Dialog */}
      <Dialog
        open={archiveSuccessOpen}
        onClose={onArchiveSuccessClose}
        aria-labelledby="archive-success-dialog-title"
      >
        <DialogTitle id="alert-dialog-slide-title">
          <Typography component="p" variant="subtitle1">
            Bill was added to Archive
          </Typography>
        </DialogTitle>
      </Dialog>
    </>
  );
};
