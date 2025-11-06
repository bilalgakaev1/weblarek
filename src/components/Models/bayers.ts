import { IBuyer, TPayment } from '../../types';
import { events } from '../base/Events';

export class Buyer {
  private data: IBuyer;

  constructor() {
    this.data = {
      payment: 'card' as TPayment,
      address: '',
      email: '',
      phone: ''
    };
  }

  getData(): IBuyer {
    return this.data;
  }

  clear() {
    this.data = { payment: 'card', address: '', email: '', phone: '' };
    events.emit('form:validate', {});
  }

  change<K extends keyof IBuyer>(key: K, value: IBuyer[K]) {
    this.data[key] = value;
    this.validate();
  }

  private validate() {
    const errors: Record<string, string> = {};

    if (!this.data.address?.trim()) {
      errors.address = 'Введите адрес доставки';
    }

    if (!this.data.email?.includes('@')) {
      errors.email = 'Некорректный email';
    }

    if (!this.data.phone?.trim()) {
      errors.phone = 'Введите номер телефона';
    }

    if (!this.data.payment) {
      errors.payment = 'Выберите способ оплаты';
    }

    events.emit('form:validate', errors);
  }
}
