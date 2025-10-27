import { events } from '../../main';
import { IProduct } from '../../types';
import { categoryMap } from '../../utils/constants';

export class CatalogCardView {
  private container: HTMLElement;
  private categoryEl: HTMLElement | null;
  private titleEl: HTMLElement | null;
  private imgEl: HTMLImageElement | null;
  private priceEl: HTMLElement | null;

  constructor() {
    const tpl = document.getElementById('card-catalog') as HTMLTemplateElement;
    if (!tpl) throw new Error('#card-catalog template not found');
    
    this.container = (tpl.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;

    
    this.categoryEl = this.container.querySelector('.card__category');
    this.titleEl = this.container.querySelector('.card__title');
    this.imgEl = this.container.querySelector('.card__image') as HTMLImageElement;
    this.priceEl = this.container.querySelector('.card__price');

   
    this.container.addEventListener('click', () => {
      const id = this.container.dataset.id;
      events.emit('product:open', { productId: id });
    });
  }

  
  render() {
    return this.container;
  }

  
  update(product: IProduct) {
    
    this.container.dataset.id = product.id;

    if (this.categoryEl) {
      this.categoryEl.textContent = product.category;
      
      const clazz = (categoryMap as Record<string, string>)[product.category] ?? 'card__category_other';
      
      this.categoryEl.className = `card__category ${clazz}`;
    }
    if (this.titleEl) this.titleEl.textContent = product.title;
    if (this.imgEl) this.imgEl.src = product.image ?? '';
    if (this.priceEl) this.priceEl.textContent = product.price != null ? `${product.price} синапсов` : '—';
  }
}
