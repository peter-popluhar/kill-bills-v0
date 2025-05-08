import { OrderItem } from '../types/OrderItem';

export const orderFormService = {
  handleLocationSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    onLocationChange: (location: string) => void
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const location = formData.get('location') as string;
    onLocationChange(location);
  },

  handleNameSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    item: OrderItem,
    onNameChange: (item: OrderItem, name: string) => void
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    onNameChange(item, name);
  },

  handlePriceSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    item: OrderItem,
    onPriceChange: (item: OrderItem, price: number) => void
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const price = Number(formData.get('price'));
    onPriceChange(item, price);
  }
}; 
