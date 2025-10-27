import { events } from '../../main';
import { IProduct } from '../../types';
import { categoryMap } from '../../utils/constants';

export class PreviewCardView {
  private root: HTMLElement;
  private imgEl: HTMLImageElement | null;
  private categoryEl: HTMLElement | null;
  private titleEl: HTMLElement | null;
  private textEl: HTMLElement | null;
  private priceEl: HTMLElement | null;
  private buyBtn: HTMLButtonElement | null;

  constructor() {
    const tpl = document.getElementById('card-preview') as HTMLTemplateElement;
    if (!tpl) throw new Error('#card-preview template not found');
    this.root = (tpl.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;

    this.imgEl = this.root.querySelector('.card__image') as HTMLImageElement;
    this.categoryEl = this.root.querySelector('.card__category');
    this.titleEl = this.root.querySelector('.card__title');
    this.textEl = this.root.querySelector('.card__text');
    this.priceEl = this.root.querySelector('.card__price');
    this.buyBtn = this.root.querySelector('.card__button') as HTMLButtonElement;

    
    this.buyBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = this.root.dataset.id;
      
      events.emit('product:add', { productId: id });
    });

    
  }

  render() { return this.root; }

  update(product: IProduct, inCart = false) {
    this.root.dataset.id = product.id;
    if (this.categoryEl) {
      const clazz = (categoryMap as Record<string, string>)[product.category] ?? 'card__category_other';
      this.categoryEl.className = `card__category ${clazz}`;
      this.categoryEl.textContent = product.category;
    }
    if (this.titleEl) this.titleEl.textContent = product.title;
    if (this.textEl) this.textEl.textContent = product.description ?? '';
    if (this.imgEl) this.imgEl.src = product.image ?? '';

    if (product.price == null) {
      if (this.buyBtn) {
        this.buyBtn.disabled = true;
        this.buyBtn.textContent = 'Недоступно';
      }
      if (this.priceEl) this.priceEl.textContent = '—';
    } else {
      if (this.buyBtn) {
        this.buyBtn.disabled = false;
        this.buyBtn.textContent = inCart ? 'Удалить из корзины' : 'В корзину';
      }
      if (this.priceEl) this.priceEl.textContent = `${product.price} синапсов`;
    }
  }
}
