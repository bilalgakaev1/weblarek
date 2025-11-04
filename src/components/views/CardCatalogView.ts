import { Component } from "../base/Component";
import { IProduct } from "../../types";
import { events } from "../base/Events";
import { getCategoryClass } from "../../utils/constants";
import { CDN_URL } from "../../utils/constants";


export class CardCatalogView extends Component<IProduct> {
    private titleElement: HTMLElement;
    private categoryElement: HTMLElement;
    private priceElement: HTMLElement;
    private imageElement: HTMLImageElement;
    private buttonElement: HTMLButtonElement;

    constructor(container: HTMLElement) {
        super(container);

        
        this.titleElement = container.querySelector('.card__title')!;
        this.categoryElement = container.querySelector('.card__category')!;
        this.priceElement = container.querySelector('.card__price')!;
        this.imageElement = container.querySelector('.card__image')!;
        this.buttonElement = container as HTMLButtonElement;

        
        this.buttonElement.addEventListener('click', () => {
            const productId = this.buttonElement.dataset.id;
            if (productId) {
                events.emit('product:open', { productId });
            }
        });
    }

    render(product: IProduct): HTMLElement {
        this.buttonElement.dataset.id = product.id;
        this.titleElement.textContent = product.title;
        this.priceElement.textContent = product.price ? `${product.price} синапсов` : 'Бесценно';
        this.categoryElement.textContent = product.category;
        this.imageElement.src = `${CDN_URL}/${product.image}`;
        this.imageElement.alt = product.title;

        
        const categoryClass = getCategoryClass(product.category);
        this.categoryElement.className = `card__category ${categoryClass}`;

        return this.container;
    }
}