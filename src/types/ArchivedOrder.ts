import { OrderItem } from './OrderItem';

export interface ArchivedOrder {
  id: string;
  date: string;
  location: string;
  items: OrderItem[];
  totalsByCurrency: {
    [key: string]: number;
  };
} 
