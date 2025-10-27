
import { events } from '../../main';

export class HeaderView {
  private root: HTMLElement;
  private basketBtn: HTMLButtonElement;
  private counterEl: HTMLElement;

  
  constructor(rootSelector = '.header', private options?: { onOpenCart?: () => void }) {
    const root = document.querySelector(rootSelector) as HTMLElement;
    if (!root) throw new Error('Header root not found');
    this.root = root;
    this.basketBtn = this.root.querySelector('.header__basket') as HTMLButtonElement;
    this.counterEl = this.root.querySelector('.header__basket-counter') as HTMLElement;

    this.basketBtn.addEventListener('click', () => {
      if (this.options?.onOpenCart) this.options.onOpenCart();
      events.emit('cart:open', {});
    });
  }

  
  setCounter(n: number) {
    this.counterEl.textContent = String(n);
    
    this.counterEl.setAttribute('aria-live', 'polite');
  }

  render() { return this.root; }
}
