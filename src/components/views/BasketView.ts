
import { events } from '../../main';
import { IProduct } from '../../types';
import { BasketItemView } from './BasketItemView'; 

export class BasketView {
  private root: HTMLElement;
  private listEl: HTMLElement;
  private priceEl: HTMLElement;
  private checkoutBtn: HTMLButtonElement;

  constructor() {
    const tpl = document.getElementById('basket') as HTMLTemplateElement;
    if (!tpl) throw new Error('#basket template not found');
    this.root = (tpl.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;

    this.listEl = this.root.querySelector('.basket__list') as HTMLElement;
    this.priceEl = this.root.querySelector('.basket__price') as HTMLElement;
    this.checkoutBtn = this.root.querySelector('.basket__button') as HTMLButtonElement;

    this.checkoutBtn.addEventListener('click', () => {
        events.emit('cart:checkout', {});
    });
  }

  render() { return this.root; }

  
  setItems(items: IProduct[]) {
    this.listEl.replaceChildren();
    if (!items.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Корзина пуста';
      this.listEl.appendChild(empty);
      this.priceEl.textContent = '0 синапсов';
      this.checkoutBtn.disabled = true;
      return;
    }

    items.forEach((p, i) => {
      const itemView = new BasketItemView();
      itemView.update(p, i);
      this.listEl.appendChild(itemView.render());
    });

    const total = items.reduce((s, it) => s + (it.price ?? 0), 0);
    this.priceEl.textContent = `${total} синапсов`;
    this.checkoutBtn.disabled = items.length === 0;
  }
}
