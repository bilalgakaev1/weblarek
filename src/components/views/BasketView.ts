import { Component } from "../base/Component";
import { events } from "../base/Events";
import { IProduct } from "../../types";
import { CardBasket } from "./CardBasket";

export class BasketView extends Component<{}> {
  private root: HTMLElement;
  private listEl: HTMLElement;
  private priceEl: HTMLElement;
  private checkoutBtn: HTMLButtonElement;

  constructor(tpl?: HTMLTemplateElement) {
    const template = tpl ?? (document.getElementById('basket') as HTMLTemplateElement);
    if (!template) throw new Error('#basket template not found');
    const root = (template.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;
    super(root);
    this.root = root;

    this.listEl = this.root.querySelector('.basket__list') as HTMLElement;
    this.priceEl = this.root.querySelector('.basket__price') as HTMLElement;
    this.checkoutBtn = this.root.querySelector('.basket__button') as HTMLButtonElement;

    
    this.checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      events.emit('cart:checkout');
    });
  }

  setItems(items: IProduct[]) {
    this.listEl.replaceChildren();

    if (!items || items.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'Корзина пуста';
      this.listEl.appendChild(empty);
      if (this.priceEl) this.priceEl.textContent = '0 синапсов';
      this.checkoutBtn.disabled = true;
      return;
    }

    items.forEach((p, i) => {
      const row = new CardBasket();
      row.update(p, i);
      this.listEl.appendChild(row.render());
    });

    const total = items.reduce((s, it) => s + (it.price ?? 0), 0);
    if (this.priceEl) this.priceEl.textContent = `${total} синапсов`;
    this.checkoutBtn.disabled = items.length === 0;
  }


  render(): HTMLElement {
    return this.root;
  }
}