
import { events } from '../../main';
import { TPayment } from '../../types';

export class OrderView {
  private form: HTMLFormElement;
  private paymentButtons: NodeListOf<HTMLButtonElement>;
  private addressInput: HTMLInputElement;
  private nextBtn: HTMLButtonElement;
  private errorsEl: HTMLElement | null;

  constructor() {
    const tpl = document.getElementById('order') as HTMLTemplateElement;
    if (!tpl) throw new Error('#order template not found');
    this.form = (tpl.content.firstElementChild as HTMLFormElement).cloneNode(true) as HTMLFormElement;

    this.paymentButtons = this.form.querySelectorAll('.order__buttons .button') as NodeListOf<HTMLButtonElement>;
    this.addressInput = this.form.querySelector('input[name="address"]') as HTMLInputElement;
    this.nextBtn = this.form.querySelector('.order__button') as HTMLButtonElement;
    this.errorsEl = this.form.querySelector('.form__errors');

    
    this.paymentButtons.forEach(btn =>
      btn.addEventListener('click', (e) => {
        const b = e.currentTarget as HTMLButtonElement;
        
        this.paymentButtons.forEach(x => x.classList.remove('button_alt-active'));
        b.classList.add('button_alt-active');
        
        const payment: TPayment = b.name as TPayment;
        events.emit('order:paymentChanged', { payment });
      })
    );

    this.addressInput.addEventListener('input', () => {
        events.emit('order:addressChanged', { address: this.addressInput.value });
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const paymentBtn = this.form.querySelector('.button_alt-active') as HTMLButtonElement | null;
      const payment: TPayment = paymentBtn ? (paymentBtn.name as TPayment) : null;
      const address = this.addressInput.value.trim();
      events.emit('order:step1:next', { paymentMethod: payment, address });
    });

    
    this.setNextEnabled(false);
  }

  render() { return this.form; }

  
  setNextEnabled(enabled: boolean) {
    this.nextBtn.disabled = !enabled;
  }

  
  showError(message: string) {
    if (this.errorsEl) this.errorsEl.textContent = message;
  }

  clearError() {
    if (this.errorsEl) this.errorsEl.textContent = '';
  }
}
