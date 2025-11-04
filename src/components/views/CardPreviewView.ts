import { Component } from "../base/Component";
import { IProduct } from "../../types";
import { events } from "../base/Events";
import { categoryMap } from "../../utils/constants";
import { CDN_URL } from "../../utils/constants";

export class CardPreviewView extends Component<IProduct> {
  private titleElement: HTMLElement;
  private descriptionElement: HTMLElement;
  private categoryElement: HTMLElement;
  private priceElement: HTMLElement;
  private imageElement: HTMLImageElement;
  private buttonElement: HTMLButtonElement;
  private currentProductId?: string;

  constructor(container: HTMLElement) {
    super(container);

    this.titleElement = container.querySelector('.card__title')!;
    this.descriptionElement = container.querySelector('.card__text')!;
    this.categoryElement = container.querySelector('.card__category')!;
    this.priceElement = container.querySelector('.card__price')!;
    this.imageElement = container.querySelector('.card__image')!;
    this.buttonElement = container.querySelector('.card__button')!;

  }

  render(product: IProduct, isInCart = false): HTMLElement {
    this.currentProductId = product.id;
    this.titleElement.textContent = product.title;
    this.descriptionElement.textContent = product.description ?? '';
    this.priceElement.textContent = product.price != null ? `${product.price} синапсов` : 'Бесценно';
    this.categoryElement.textContent = product.category;

    
    const categoryClass = categoryMap[product.category as keyof typeof categoryMap] || '';
    this.categoryElement.className = `card__category ${categoryClass}`;

    
    this.imageElement.src = `${CDN_URL}/${product.image}`;
    this.imageElement.alt = product.title;

    
    this.buttonElement.textContent = isInCart ? 'Убрать из корзины' : 'В корзину';

    if (product.price == null) {
      this.buttonElement.disabled = true;
      this.buttonElement.textContent = 'Недоступно';
      this.buttonElement.onclick = null;
    } else {
      this.buttonElement.disabled = false;
      this.buttonElement.textContent = isInCart ? 'Удалить из корзины' : 'В корзину';

      this.buttonElement.onclick = (e) => {
        e.preventDefault();
        if (!this.currentProductId) return;
        if (isInCart) {
          events.emit('product:remove', { productId: this.currentProductId });
        } else {
          events.emit('product:add', { productId: this.currentProductId });
        }
      };
    }

    return this.container;
  }
}