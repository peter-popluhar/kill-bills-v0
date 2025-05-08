export interface ArchivedOrderItem {
  itemName: string;
  itemInitialPrice: number;
  itemCalculatedAmount: number;
  itemCalculatedPrice: number;
  currency: string;
}

export interface ArchivedOrder {
  archiveId: string;
  date: string;
  time: string;
  location: string;
  items: ArchivedOrderItem[];
  totalsByCurrency: { [key: string]: number };
  user: string;
} 
