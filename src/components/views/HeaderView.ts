import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { events } from "../base/Events";

export class HeaderView extends Component<HTMLElement> {
  private rootEl: HTMLElement;
  private basketBtn: HTMLButtonElement | null;
  private counterEl: HTMLElement | null;

  constructor(rootSelector: string | HTMLElement = '.header') {
    const root = ensureElement<HTMLElement>(rootSelector as any);
    super(root);
    this.rootEl = root;

    this.basketBtn = this.rootEl.querySelector('.header__basket') as HTMLButtonElement | null;
    this.counterEl = this.rootEl.querySelector('.header__basket-counter') as HTMLElement | null;

    
    this.basketBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      events.emit('cart:open', undefined);
    });
  }

  setCounter(count: number) {
    if (!this.counterEl) return;
    this.counterEl.textContent = String(count);
    if (count > 0) {
      this.counterEl.style.display = '';
    } else {
      this.counterEl.style.display = '';
    }
  }

  render(): HTMLElement {
    return this.rootEl;
  }
}