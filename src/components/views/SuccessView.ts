
import { events } from '../../main';

export class SuccessView {
  private root: HTMLElement;
  private closeBtn: HTMLButtonElement | null;

  constructor() {
    const tpl = document.getElementById('success') as HTMLTemplateElement;
    if (!tpl) throw new Error('#success template not found');
    this.root = (tpl.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;
    this.closeBtn = this.root.querySelector('.order-success__close') as HTMLButtonElement | null;

    this.closeBtn?.addEventListener('click', () => events.emit('order:success:close', {}));
  }

  render() { return this.root; }

  update(total: number) {
    const desc = this.root.querySelector('.order-success__description') as HTMLElement | null;
    if (desc) desc.textContent = `Списано ${total} синапсов`;
  }
}
