import { IBuyer, TPayment } from "../../types";
import { events } from '../../main';


export class Bayer implements IBuyer {
    address = '';
    phone = '';
    email = '';
    payment: TPayment = null;
  
    constructor(payment?: TPayment, address = '', phone = '', email = '') {
      if (payment) this.payment = payment;
      this.address = address;
      this.phone = phone;
      this.email = email;
    }
  
    setAddress(address: string) {
      this.address = address;
      events.emit('order:changed', { field: 'address', value: address });
      this.emitValidated();
    }
  
    setPhone(phone: string) {
      this.phone = phone;
      events.emit('order:changed', { field: 'phone', value: phone });
      this.emitValidated();
    }
  
    setEmail(email: string) {
      this.email = email;
      events.emit('order:changed', { field: 'email', value: email });
      this.emitValidated();
    }
  
    setPayment(payment: TPayment) {
      this.payment = payment;
      events.emit('order:changed', { field: 'payment', value: payment });
      this.emitValidated();
    }
  
    clear(): void {
      this.address = '';
      this.payment = null;
      this.email = '';
      this.phone = '';
      events.emit('order:cleared', {});
      this.emitValidated(); // теперь isValid = false
    }
  
    validate(): boolean {
      const isValid =
        this.address.length > 0 &&
        this.email.includes('@') &&
        this.phone.length > 0 &&
        this.payment != null;
      return isValid;
    }
  
    private emitValidated() {
      events.emit('order:validated', { isValid: this.validate() });
    }
  
    getData(): object {
      return {
        address: this.address,
        phone: this.phone,
        email: this.email,
        payment: this.payment
      };
    }
  }