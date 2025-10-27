
import { typedEvents as events } from '../base/Events';



import { Products } from '../Models/products';
import { Carts } from '../Models/carts';
import { Bayer } from '../Models/bayers';


import { HeaderView } from '../views/HeaderView';
import { CatalogView } from '../views/CatalogView';
import { ModalView } from '../views/ModalView';
import { PreviewCardView } from '../views/PreviewCardView';
import { BasketView } from '../views/BasketView';
import { OrderView } from '../views/OrderView';
import { ContactsView } from '../views/ContactsView';
import { SuccessView } from '../views/SuccessView';

export class Presenter {
  private productsModel: Products;
  private cartModel: Carts;
  private buyerModel: Bayer;

  private headerView: HeaderView;
  private catalogView: CatalogView;
  private modalView: ModalView;


  private currentModalInner: any = null;

  constructor(opts: {
    productsModel: Products,
    cartModel: Carts,
    buyerModel: Bayer,
    headerView: HeaderView,
    catalogView: CatalogView,
    modalView: ModalView
  }) {
    this.productsModel = opts.productsModel;
    this.cartModel = opts.cartModel;
    this.buyerModel = opts.buyerModel;
    this.headerView = opts.headerView;
    this.catalogView = opts.catalogView;
    this.modalView = opts.modalView;


    events.on('catalog:updated', (products) => this.onCatalogUpdated(products));
    events.on('cart:changed', (items) => this.onCartChanged(items));
    events.on('product:selected', (product) => this.onProductSelected(product));
    events.on('order:validated', (isValid) => this.onOrderValidated(isValid));

    events.on('product:open', ({ productId }) => this.handleProductOpen(productId));
    events.on('product:add', ({ productId }) => this.handleAddProduct(productId));
    events.on('product:remove', ({ productId }) => this.handleRemoveProduct(productId));

    events.on('cart:open', () => this.handleOpenCart());
    events.on('cart:item:remove', ({ productId }) => this.handleRemoveFromCart(productId));
    events.on('cart:checkout', () => this.handleCheckoutStart());

    events.on('order:paymentChanged', ({ payment }) => this.buyerModel.setPayment(payment));
    events.on('order:addressChanged', ({ address }) => this.buyerModel.setAddress(address));

    events.on('order:step1', ({ paymentMethod, address }) => this.handleStep1Next(paymentMethod, address));
    events.on('contacts:changed', ({ email, phone }) => { 
        this.buyerModel.setEmail(email); 
        this.buyerModel.setPhone(phone); 
    });
    events.on('checkout:step2', ({ email, phone }) => this.handleFinalPay(email, phone));

    events.on('modal:close', () => this.onModalClosed());
    events.on('order:success:close', () => this.modalView.close());
  }



  private onCatalogUpdated(products: any[]) {
    
    this.catalogView.renderProducts(products);
  }

  private onCartChanged(items: any[]) {
    
    const count = items.length;
    this.headerView.setCounter(count);

    
    if (this.currentModalInner && this.currentModalInner instanceof BasketView) {
      (this.currentModalInner as BasketView).setItems(items);
    }

    
    // if (this.currentModalInner && this.currentModalInner instanceof PreviewCardView) {
    //   const pid = (this.currentModalInner as PreviewCardView).getProductId?.();
    //   if (pid) {
    //     const inCart = this.cartModel.hasProduct(pid);
    //     (this.currentModalInner as PreviewCardView).update(this.productsModel.getById(pid), inCart);
    //   }
    // }
  }

  private onProductSelected(product: any) {
    
    const inCart = this.cartModel.hasProduct(product.id);
    const preview = new PreviewCardView();
    preview.update(product, inCart);
    this.currentModalInner = preview;
    this.modalView.open(preview.render());
  }

  private onOrderValidated(isValid: boolean) {
    
    if (this.currentModalInner instanceof OrderView) {
      (this.currentModalInner as OrderView).setNextEnabled(isValid);
    }
    if (this.currentModalInner instanceof ContactsView) {
      (this.currentModalInner as ContactsView).setPayEnabled(isValid);
    }
  }



  private async handleProductOpen(productId: string) {
    
    const product = this.productsModel.getProductById(productId);
    if (!product) return;

    const inCart = this.cartModel.hasProduct(productId);
    const preview = new PreviewCardView();
    preview.update(product, inCart);

    this.currentModalInner = preview;
    this.modalView.open(preview.render());
  }

  private handleAddProduct(productId: string) {
    const product = this.productsModel.getProductById(productId);
    if (!product) return;
    
    this.cartModel.addItems(product);
    
    this.modalView.close();
  }

  private handleRemoveProduct(productId: string) {
    const product = this.cartModel.getItems().find((p) => p.id === productId);
    if (!product) return;
    this.cartModel.removeItems(product);
    this.modalView.close();
  }

  private handleOpenCart() {
    const basket = new BasketView();
    const items = this.cartModel.getItems();
    basket.setItems(items);
    this.currentModalInner = basket;
    this.modalView.open(basket.render());
  }

  private handleRemoveFromCart(productId: string) {
    const product = this.cartModel.getItems().find((p) => p.id === productId);
    if (!product) return;
    this.cartModel.removeItems(product);
  }

  private handleCheckoutStart() {
    
    const orderView = new OrderView();
    
    this.currentModalInner = orderView;
    
    orderView.setNextEnabled(this.buyerModel.validate());
    this.modalView.open(orderView.render());
  }

  private handleStep1Next(paymentMethod: any, address: string) {
    
    this.buyerModel.setPayment(paymentMethod);
    this.buyerModel.setAddress(address);
   
    if (this.buyerModel.validate()) {
      const contacts = new ContactsView();
      contacts.setPayEnabled(this.buyerModel.validate());
      this.currentModalInner = contacts;
      this.modalView.open(contacts.render());
    } else {
      
      if (this.currentModalInner instanceof OrderView) {
        (this.currentModalInner as OrderView).showError('Проверьте поля формы');
      }
    }
  }

  private async handleFinalPay(email: string, phone: string) {
    
    this.buyerModel.setEmail(email);
    this.buyerModel.setPhone(phone);

    
    if (!this.buyerModel.validate()) {
      if (this.currentModalInner instanceof ContactsView) {
        (this.currentModalInner as ContactsView).showError('Заполните все поля корректно');
      }
      return;
    }

    
    try {
      const orderData = {
        buyer: this.buyerModel.getData(),
        items: this.cartModel.getItems(),
        total: this.cartModel.getTotalPrice()
      };
      
      await new Promise(resolve => setTimeout(resolve, 600));

      
      this.cartModel.clear();
      this.buyerModel.clear();

      
      const success = new SuccessView();
      success.update(orderData.total ?? 0);
      this.currentModalInner = success;
      this.modalView.open(success.render());
    } catch (err) {
      
      if (this.currentModalInner instanceof ContactsView) {
        (this.currentModalInner as ContactsView).showError('Ошибка оплаты. Попробуйте позже');
      }
    }
  }

  private onModalClosed() {
    
    this.currentModalInner = null;
  }
}
