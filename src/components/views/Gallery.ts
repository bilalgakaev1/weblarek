import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";


export class Gallery extends Component<HTMLElement> {
  private containerEl: HTMLElement;

  
  constructor(container: string | HTMLElement = 'main.gallery') {
    const el = ensureElement<HTMLElement>(container as any);
    super(el);
    this.containerEl = el;
  }

 
  set items(products: HTMLElement[]) {
    if (!products || !products.length) {
      this.containerEl.replaceChildren();
      return;
    }
    this.containerEl.replaceChildren(...products);
  }

  render(): HTMLElement {
    return this.containerEl;
  }
}