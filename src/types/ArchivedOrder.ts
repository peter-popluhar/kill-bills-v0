import { OrderItem } from './OrderItem';

export interface ArchivedOrder {
  id: string;
  archiveId: string;
  date: string;
  time: string;
  location: string;
  items: OrderItem[];
  totalsByCurrency: {
    [key: string]: number;
  };
} 
