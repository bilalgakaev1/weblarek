import { Component } from "../base/Component";
import { events } from "../base/Events";


export class ContactsView extends Component<{}> {
  private root: HTMLElement;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private payBtn: HTMLButtonElement;
  private errorEl: HTMLElement | null;

  constructor(tpl?: HTMLTemplateElement) {
    const template = tpl ?? (document.getElementById('contacts') as HTMLTemplateElement | null);
    if (!template) throw new Error('#contacts template not found');
    const root = (template.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;
    super(root);
    this.root = root;

    this.emailInput = this.root.querySelector('input[name="email"]') as HTMLInputElement;
    this.phoneInput = this.root.querySelector('input[name="phone"]') as HTMLInputElement;
    this.payBtn = this.root.querySelector('button[type="submit"], .contacts__pay') as HTMLButtonElement;
    this.errorEl = this.root.querySelector('.form__errors');

    this.emailInput.addEventListener('input', () => {
      events.emit('contacts:changed', { email: this.emailInput.value.trim(), phone: this.phoneInput.value.trim() });
      this.validate();
    });
    this.phoneInput.addEventListener('input', () => {
      events.emit('contacts:changed', { email: this.emailInput.value.trim(), phone: this.phoneInput.value.trim() });
      this.validate();
    });

    this.payBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const email = this.emailInput.value.trim();
      const phone = this.phoneInput.value.trim();

      if (!email || !email.includes('@') || !phone) {
        this.showError('Введите корректный email и телефон');
        return;
      }
      
      events.emit('checkout:step2', { email, phone });
    });

    this.setPayEnabled(false);
  }

  setPayEnabled(enabled: boolean) {
    this.payBtn.disabled = !enabled;
  }

  validate(): boolean {
    const email = this.emailInput.value.trim();
    const phone = this.phoneInput.value.trim();
    const ok = email.length > 0 && email.includes('@') && phone.length > 0;
    this.setPayEnabled(ok);
    return ok;
  }

  showError(text: string) {
    if (this.errorEl) {
      this.errorEl.textContent = text;
    } else {
      console.warn('Contacts error:', text);
    }
  }

  render(): HTMLElement {
    return this.root;
  }
}