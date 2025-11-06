
import { Component } from "../base/Component";

export abstract class FormView extends Component<{}> {
  protected root: HTMLElement;
  protected inputs: HTMLInputElement[] = [];
  protected submitBtn: HTMLButtonElement | null = null;
  protected paymentButtons: NodeListOf<HTMLButtonElement> | null = null;
  protected formErrorsEl: HTMLElement | null = null;

  constructor(root: HTMLElement) {
    super(root);
    this.root = root;

    this.inputs = Array.from(this.root.querySelectorAll<HTMLInputElement>('input[name]'));
    this.submitBtn = this.root.querySelector('button[type="submit"], .order__button, .contacts__pay');
    this.paymentButtons = this.root.querySelectorAll('.order__buttons .button') as NodeListOf<HTMLButtonElement> | null;
    this.formErrorsEl = this.root.querySelector('.form__errors');
  }

  showErrors(errors: Record<string, string> | null | undefined) {
    const errs = errors ?? {};
    if (this.formErrorsEl) {
      const text = Object.values(errs).filter(Boolean).join('. ');
      this.formErrorsEl.textContent = text;
    }

    this.inputs.forEach(input => {
      const name = input.name;
      if (errs[name]) input.classList.add('invalid');
      else input.classList.remove('invalid');
    });
  }

  setSubmitEnabled(enabled: boolean) {
    if (this.submitBtn) this.submitBtn.disabled = !enabled;
  }

  render(): HTMLElement {
    return this.root;
  }
}
