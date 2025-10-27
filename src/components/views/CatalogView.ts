
import { CatalogCardView } from './CatalogCardView';
import { IProduct } from '../../types';

export class CatalogView {
  private galleryRoot: HTMLElement;

  constructor(rootSelector = 'main.gallery') {
    const root = document.querySelector(rootSelector) as HTMLElement;
    if (!root) throw new Error('Gallery root not found');
    this.galleryRoot = root;
  }

  renderProducts(products: IProduct[]) {
    this.galleryRoot.replaceChildren();
    products.forEach(prod => {
      const card = new CatalogCardView();
      card.update(prod);
      this.galleryRoot.appendChild(card.render());
    });
  }
}
