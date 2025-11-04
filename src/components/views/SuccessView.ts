import { Component } from "../base/Component";
import { events } from "../base/Events";

export class SuccessView extends Component<{}> {
  private root: HTMLElement;
  private descEl: HTMLElement | null;
  private closeBtn: HTMLButtonElement | null;

  constructor(tpl?: HTMLTemplateElement) {
    const template = tpl ?? (document.getElementById('success') as HTMLTemplateElement | null);
    if (!template) throw new Error('#success template not found');
    const root = (template.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;
    super(root);
    this.root = root;

    this.descEl = this.root.querySelector('.order-success__description');
    this.closeBtn = this.root.querySelector('.order-success__close') as HTMLButtonElement | null;

    this.closeBtn?.addEventListener('click', (ev) => {
      ev.preventDefault();
      events.emit('order:success:close', undefined);
    });
  }

  
  update(total: number) {
    if (this.descEl) {
      this.descEl.textContent = `Списано ${total} синапсов`;
    }
  }

  render(): HTMLElement {
    return this.root;
  }
}