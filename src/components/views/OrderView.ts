import { FormView } from "./FormView";
import { events } from "../base/Events";
import { TPayment } from "../../types";

export class OrderView extends FormView {
  rootEl: HTMLElement;
  addressInput: HTMLInputElement;
  nextBtn: HTMLButtonElement;
  paymentButtons: NodeListOf<HTMLButtonElement>;

  constructor(tpl?: HTMLTemplateElement) {
    const template = tpl ?? (document.getElementById('order') as HTMLTemplateElement | null);
    if (!template) throw new Error('#order template not found');
    const root = (template.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;

    super(root);
    this.rootEl = root;

    this.addressInput = this.rootEl.querySelector('input[name="address"]') as HTMLInputElement;
    this.nextBtn = this.rootEl.querySelector('.order__button') as HTMLButtonElement;
    this.paymentButtons = this.rootEl.querySelectorAll('.order__buttons .button') as NodeListOf<HTMLButtonElement>;

    this.addressInput.addEventListener('input', () => {
      const val = this.addressInput.value.trim();
      events.emit('buyer:change', { key: 'address', value: val });
    });

    this.paymentButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.paymentButtons.forEach(b => b.classList.remove('button_alt-active'));
        btn.classList.add('button_alt-active');

        const name = (btn.getAttribute('name') ?? btn.dataset.payment ?? btn.textContent ?? '').trim();
        const payment: TPayment = name === 'card' ? 'card' : (name === 'cash' ? 'cash' : null);
        events.emit('buyer:change', { key: 'payment', value: payment });
      });
    });

    this.nextBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const address = this.addressInput.value.trim();
      const active = Array.from(this.paymentButtons).find(b => b.classList.contains('button_alt-active'));
      const name = active?.getAttribute('name') ?? active?.dataset.payment ?? active?.textContent ?? '';
      const paymentMethod: TPayment = name === 'card' ? 'card' : (name === 'cash' ? 'cash' : null);
      events.emit('order:delivery', { paymentMethod, address });
    });
  }
}
