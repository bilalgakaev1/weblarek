import { FormView } from "./FormView";
import { events } from "../base/Events";

export class ContactsView extends FormView {
  private rootEl: HTMLElement;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private payBtn: HTMLButtonElement;

  constructor(tpl?: HTMLTemplateElement) {
    const template = tpl ?? (document.getElementById('contacts') as HTMLTemplateElement | null);
    if (!template) throw new Error('#contacts template not found');
    const root = (template.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;

    super(root);
    this.rootEl = root;

    this.emailInput = this.rootEl.querySelector('input[name="email"]') as HTMLInputElement;
    this.phoneInput = this.rootEl.querySelector('input[name="phone"]') as HTMLInputElement;
    this.payBtn = this.rootEl.querySelector('button[type="submit"], .contacts__pay') as HTMLButtonElement;

    this.emailInput.addEventListener('input', () => {
      events.emit('buyer:change', { key: 'email', value: this.emailInput.value.trim() });
    });
    this.phoneInput.addEventListener('input', () => {
      events.emit('buyer:change', { key: 'phone', value: this.phoneInput.value.trim() });
    });

    this.payBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const email = this.emailInput.value.trim();
      const phone = this.phoneInput.value.trim();
      events.emit('checkout:contacts', { email, phone });
    });
  }
}
