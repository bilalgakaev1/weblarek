import { Component } from "../base/Component";
import { events } from "../base/Events";

interface IModal {
  open(content: HTMLElement): void;
  close(): void;
  render(): HTMLElement;
}

export class ModalView extends Component<{}> implements IModal {
  private contentContainer: HTMLElement;
  private closeButton: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);

    this.contentContainer = container.querySelector('.modal__content')!;
    this.closeButton = container.querySelector('.modal__close')!;

    this.closeButton.addEventListener('click', () => this.close());
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  open(content: HTMLElement) {
    this.contentContainer.replaceChildren(content);
    this.container.classList.add('modal_active');
  }

  close() {
    this.container.classList.remove('modal_active');
    this.contentContainer.innerHTML = '';
    events.emit('modal:close', {});
  }

  render(): HTMLElement {
    return this.container;
  }
}