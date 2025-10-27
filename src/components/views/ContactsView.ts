
import { events } from '../../main';

export class ContactsView {
  private form: HTMLFormElement;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private payBtn: HTMLButtonElement;
  private errorsEl: HTMLElement | null;

  constructor() {
    const tpl = document.getElementById('contacts') as HTMLTemplateElement;
    if (!tpl) throw new Error('#contacts template not found');
    this.form = (tpl.content.firstElementChild as HTMLFormElement).cloneNode(true) as HTMLFormElement;

    this.emailInput = this.form.querySelector('input[name="email"]') as HTMLInputElement;
    this.phoneInput = this.form.querySelector('input[name="phone"]') as HTMLInputElement;
    this.payBtn = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;
    this.errorsEl = this.form.querySelector('.form__errors');

    this.emailInput.addEventListener('input', () => events.emit('contacts:changed', { email: this.emailInput.value, phone: this.phoneInput.value }));
    this.phoneInput.addEventListener('input', () => events.emit('contacts:changed', { email: this.emailInput.value, phone: this.phoneInput.value }));

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      events.emit('checkout:step2:pay', { email: this.emailInput.value.trim(), phone: this.phoneInput.value.trim() });
    });

    this.setPayEnabled(false);
  }

  render() { return this.form; }

  setPayEnabled(enabled: boolean) {
    this.payBtn.disabled = !enabled;
  }

  showError(message: string) { if (this.errorsEl) this.errorsEl.textContent = message; }
  clearError() { if (this.errorsEl) this.errorsEl.textContent = ''; }
}
