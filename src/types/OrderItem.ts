export interface OrderItem {
  id?: string;
  archiveId: number;
  billLocation: string;
  currency: string;
  currentDate: string;
  currentTime: string;
  itemCalculatedAmount: number;
  itemCalculatedPrice: number;
  itemInitialAmount: number;
  itemInitialPrice: number;
  itemName: string;
  user: string;
} 
