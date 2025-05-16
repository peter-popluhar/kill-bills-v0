import { useState } from 'react';
import { OrderItem } from '../types/OrderItem';

interface UseModalHookReturn {
  // Location modal states and handlers
  locationModalOpen: boolean;
  locationInput: string;
  handleOpenLocationModal: (currentLocation: string) => void;
  handleCloseLocationModal: () => void;
  handleLocationInputChange: (value: string) => void;
  
  // Name modal states and handlers
  nameModalOpen: boolean;
  nameInput: string;
  currentEditingItem: OrderItem | null;
  handleOpenNameModal: (item: OrderItem) => void;
  handleCloseNameModal: () => void;
  handleNameInputChange: (value: string) => void;
  
  // Price modal states and handlers
  priceModalOpen: boolean;
  priceInput: string;
  handleOpenPriceModal: (item: OrderItem) => void;
  handleClosePriceModal: () => void;
  handlePriceInputChange: (value: string) => void;
  
  // Archive success modal state and handler
  archiveSuccessOpen: boolean;
  setArchiveSuccessOpen: (isOpen: boolean) => void;
  showArchiveSuccess: () => void;
}

export function useModalControls(): UseModalHookReturn {
  // Location modal state
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  
  // Name modal state
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  
  // Current editing item reference
  const [currentEditingItem, setCurrentEditingItem] = useState<OrderItem | null>(null);
  
  // Price modal state
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  
  // Archive success dialog state
  const [archiveSuccessOpen, setArchiveSuccessOpen] = useState(false);
  
  // Location modal handlers
  const handleOpenLocationModal = (currentLocation: string) => {
    setLocationInput(currentLocation || '');
    setLocationModalOpen(true);
  };
  
  const handleCloseLocationModal = () => setLocationModalOpen(false);
  const handleLocationInputChange = (value: string) => setLocationInput(value);
  
  // Name modal handlers
  const handleOpenNameModal = (item: OrderItem) => {
    setNameInput(item.itemName);
    setCurrentEditingItem(item);
    setNameModalOpen(true);
  };
  
  const handleCloseNameModal = () => setNameModalOpen(false);
  const handleNameInputChange = (value: string) => setNameInput(value);
  
  // Price modal handlers
  const handleOpenPriceModal = (item: OrderItem) => {
    setPriceInput(item.itemInitialPrice.toString());
    setCurrentEditingItem(item);
    setPriceModalOpen(true);
  };
  
  const handleClosePriceModal = () => setPriceModalOpen(false);
  const handlePriceInputChange = (value: string) => setPriceInput(value);
  
  // Archive success handler
  const showArchiveSuccess = () => {
    setArchiveSuccessOpen(true);
    // Auto close after 1.5 seconds
    setTimeout(() => {
      setArchiveSuccessOpen(false);
    }, 1500);
  };
  
  return {
    // Location modal
    locationModalOpen,
    locationInput,
    handleOpenLocationModal,
    handleCloseLocationModal,
    handleLocationInputChange,
    
    // Name modal
    nameModalOpen,
    nameInput,
    currentEditingItem,
    handleOpenNameModal,
    handleCloseNameModal,
    handleNameInputChange,
    
    // Price modal
    priceModalOpen,
    priceInput,
    handleOpenPriceModal,
    handleClosePriceModal,
    handlePriceInputChange,
    
    // Archive success
    archiveSuccessOpen,
    setArchiveSuccessOpen,
    showArchiveSuccess
  };
}
