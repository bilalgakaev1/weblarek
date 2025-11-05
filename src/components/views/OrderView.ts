import { Component } from "../base/Component";
import { events } from "../base/Events";
import { TPayment } from "../../types";


export class OrderView extends Component<{}> {
  private root: HTMLElement;
  private paymentButtons: NodeListOf<HTMLButtonElement>;
  private addressInput: HTMLInputElement;
  private nextBtn: HTMLButtonElement;
  private errorEl: HTMLElement | null;
  private selectedPayment: TPayment = null;

  constructor(tpl?: HTMLTemplateElement) {
    const template = tpl ?? (document.getElementById('order') as HTMLTemplateElement | null);
    if (!template) throw new Error('#order template not found');
    const root = (template.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;
    super(root);
    this.root = root;


    this.paymentButtons = this.root.querySelectorAll('.order__buttons .button') as NodeListOf<HTMLButtonElement>;
    this.addressInput = this.root.querySelector('input[name="address"]') as HTMLInputElement;
    this.nextBtn = this.root.querySelector('.order__button') as HTMLButtonElement;
    this.errorEl = this.root.querySelector('.form__errors');


    this.paymentButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        
        this.paymentButtons.forEach(b => b.classList.remove('button_alt-active'));
        btn.classList.add('button_alt-active');


        const name = btn.getAttribute('name') ?? btn.dataset.payment ?? btn.textContent ?? '';

        const payment: TPayment = (name === 'card' ? 'card' : (name === 'cash' ? 'cash' : null));
        this.selectedPayment = payment;
        events.emit('order:paymentChanged', { payment });
        this.validate();
      });
    });

    this.addressInput.addEventListener('input', () => {
      const address = this.addressInput.value.trim();
      events.emit('order:addressChanged', { address });
      this.validate();
    });


    this.nextBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const address = this.addressInput.value.trim();
      if (!this.selectedPayment || address.length === 0) {
        this.showError('Выберите способ оплаты и введите адрес доставки.');
        return;
      }

      events.emit('order:delivery', { paymentMethod: this.selectedPayment, address });
    });

    this.setNextEnabled(false);
  }

  setNextEnabled(enabled: boolean) {
    this.nextBtn.disabled = !enabled;
  }

  validate(): boolean {
    const addressOk = this.addressInput.value.trim().length > 0;
    const paymentOk = this.selectedPayment != null;
    const ok = addressOk && paymentOk;
    this.setNextEnabled(ok);
    return ok;
  }

  showError(text: string) {
    if (this.errorEl) {
      this.errorEl.textContent = text;
    } else {
      console.warn('Order error:', text);
    }
  }

  render(): HTMLElement {
    return this.root;
  }
}