import { events } from '../../main';
import { IProduct } from '../../types';

export class BasketItemView {
  private root: HTMLElement;
  private indexEl: HTMLElement | null;
  private titleEl: HTMLElement | null;
  private priceEl: HTMLElement | null;
  private deleteBtn: HTMLButtonElement | null;

  constructor() {
    const tpl = document.getElementById('card-basket') as HTMLTemplateElement;
    if (!tpl) throw new Error('#card-basket template not found');
    this.root = (tpl.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;

    this.indexEl = this.root.querySelector('.basket__item-index');
    this.titleEl = this.root.querySelector('.card__title');
    this.priceEl = this.root.querySelector('.card__price');
    this.deleteBtn = this.root.querySelector('.basket__item-delete') as HTMLButtonElement;

    this.deleteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = this.root.dataset.id;
      events.emit('cart:item:remove', { productId: id });
    });
  }

  render() { return this.root; }

  update(product: IProduct, index: number) {
    this.root.dataset.id = product.id;
    if (this.indexEl) this.indexEl.textContent = String(index + 1);
    if (this.titleEl) this.titleEl.textContent = product.title;
    if (this.priceEl) this.priceEl.textContent = product.price != null ? `${product.price} синапсов` : '—';
  }
}
