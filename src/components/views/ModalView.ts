import { events } from '../../main';

export class ModalView {
    private modal: HTMLElement;
    private inner: HTMLElement;
    private closeBtn: HTMLElement;
  
    constructor() {
      const modalEl = document.querySelector('.modal') as HTMLElement;
      if (!modalEl) throw new Error('Modal element .modal not found in DOM');
      this.modal = modalEl;
      this.inner = this.modal.querySelector('.modal__content') as HTMLElement;
      this.closeBtn = this.modal.querySelector('.modal__close') as HTMLElement;
  
      
      this.onOverlayClick = this.onOverlayClick.bind(this);
      this.onCloseClick = this.onCloseClick.bind(this);
      this.onEsc = this.onEsc.bind(this);
  
      this.modal.addEventListener('click', this.onOverlayClick);
      this.closeBtn.addEventListener('click', this.onCloseClick);
      document.addEventListener('keydown', this.onEsc);
    }
  
    
    open(content: HTMLElement) {
      this.setContent(content);
      this.modal.classList.add('modal_active');
      document.body.style.overflow = 'hidden';
    }
  
    setContent(node: HTMLElement) {
      this.inner.replaceChildren(node);
    }
  
    close() {
      this.modal.classList.remove('modal_active');
      this.inner.replaceChildren();
      document.body.style.overflow = '';
      events.emit('modal:close', {});
    }
  
    
    private onOverlayClick(e: MouseEvent) {
      if (e.target === this.modal) this.close();
    }
    private onCloseClick() { this.close(); }
    private onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') this.close();
    }
  
    
    render() {
      return this.modal;
    }
  }