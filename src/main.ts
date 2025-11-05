import './scss/styles.scss';

import { events } from './components/base/Events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { API_URL } from './utils/constants';

import { Products } from './components/Models/products';
import { Carts } from './components/Models/carts';
import { Buyer } from './components/Models/bayers';
import { Communication } from './components/Models/Communication';
import { OrderRequest } from './types';

import { Gallery } from './components/views/Gallery';
import { HeaderView } from './components/views/HeaderView';
import { ModalView } from './components/views/ModalView';
import { CardCatalogView } from './components/views/CardCatalogView';
import { CardPreviewView } from './components/views/CardPreviewView';
import { BasketView } from './components/views/BasketView';
import { OrderView } from './components/views/OrderView';
import { ContactsView } from './components/views/ContactsView';
import { SuccessView } from './components/views/SuccessView';

import { apiProducts } from './utils/data';

const api = new Communication(API_URL);
const productsModel = new Products();
const cartModel = new Carts();
const buyerModel = new Buyer();

const gallery = new Gallery('main.gallery');
const header = new HeaderView('.header');
const modal = new ModalView(ensureElement('#modal-container'));

const basketTpl = ensureElement<HTMLTemplateElement>('#basket');
const basketView = new BasketView(basketTpl);

const orderTpl = ensureElement<HTMLTemplateElement>('#order');
const orderView = new OrderView(orderTpl);

const contactsTpl = ensureElement<HTMLTemplateElement>('#contacts');
const contactsView = new ContactsView(contactsTpl);

const successTpl = ensureElement<HTMLTemplateElement>('#success');
const successView = new SuccessView(successTpl);

function getBuyerSafe() {
  const bd = buyerModel.getData() as any; 
  return {
    payment: bd?.payment ?? 'card',
    address: bd?.address ?? '',
    email: bd?.email ?? '',
    phone: bd?.phone ?? ''
  };
}

async function loadProducts() {
  try {
    const res = await api.fetchProducts();
    productsModel.saveProducts(res.items);
    console.log('Товары загружены с сервера:', res.items.length);
  } catch (err) {
    console.warn('Не удалось загрузить товары с сервера, используем локальные данные.', err);
    productsModel.saveProducts(apiProducts.items);
  }
}
loadProducts();

events.on('catalog:updated', () => {
  const all = productsModel.getProducts();
  const nodes = all.map((p) => {
    const tplClone = cloneTemplate('#card-catalog');
    const card = new CardCatalogView(tplClone);
    return card.render(p);
  });
  gallery.items = nodes;
});

/*
  product:open — view emits when user clicks catalog card.
  Правильный поток: product:open -> модель.setSelectedProduct(...) -> модель эмитит product:selected -> презентер открывает preview.
  Поэтому здесь только обновляем модель.
*/
events.on('product:open', (payload: any) => {
  const productId = payload?.productId;
  if (!productId) return;
  const product = productsModel.getProductById(productId);
  if (!product) return;
  // записываем выбор в модель — модель должна эмитить 'product:selected'
  productsModel.setSelectedProduct(product);
});

events.on('product:selected', (product: any) => {
  if (!product) return;
  const tplClone = cloneTemplate('#card-preview');
  const preview = new CardPreviewView(tplClone);
  const isInCart = cartModel.hasProduct(product.id);
  const el = preview.render(product, isInCart);
  modal.open(el);
});

// ---- Add / Remove product handlers (models keep single source of truth) ----
// Эти обработчики меняют только модель (без закрытия модалки).
// View должен эмитить событие закрытия модалки сам (modal:close-request) после emit 'product:add' / 'product:remove'.
events.on('product:add', (payload: any) => {
  const productId = payload?.productId;
  if (!productId) return;
  const product = productsModel.getProductById(productId);
  if (!product) return;
  cartModel.addItem(product);
});

events.on('product:remove', (payload: any) => {
  const productId = payload?.productId;
  if (!productId) return;
  const product = cartModel.getItem().find((p) => p.id === productId);
  if (!product) return;
  cartModel.removeItem(product);
});

events.on('modal:close-request', () => {
  modal.close();
});

events.on('cart:open', () => {
  basketView.setItems(cartModel.getItem());
  modal.open(basketView.render());
});

events.on('cart:item:remove', (payload: any) => {
  const productId = payload?.productId;
  if (!productId) return;
  const product = cartModel.getItem().find((p) => p.id === productId);
  if (!product) return;
  cartModel.removeItem(product);
});

events.on('cart:changed', () => {
  header.setCounter(cartModel.getCount());

  const modalNode = ensureElement('#modal-container');
  const modalContent = modalNode.querySelector('.modal__content') as HTMLElement | null;
  if (modalNode.classList.contains('modal_active') && modalContent?.querySelector('.basket')) {
    basketView.setItems(cartModel.getItem());
    modal.open(basketView.render());
  }
});

events.on('cart:checkout', () => {
  modal.open(orderView.render());
});

events.on('order:paymentChanged', (payload: any) => {
  const payment = payload?.payment;
  buyerModel.setPayment(payment);
});
events.on('order:addressChanged', (payload: any) => {
  const address = payload?.address;
  buyerModel.setAddress(address);
});

const handleOrderStep1 = (payload: any) => {
  const paymentMethod = payload?.paymentMethod;
  const address = payload?.address;
  if (!paymentMethod || !address) return;

  buyerModel.setPayment(paymentMethod);
  buyerModel.setAddress(address);

  modal.open(contactsView.render());
};
events.on('order:delivery', handleOrderStep1);

events.on('contacts:changed', (payload: any) => {
  const email = payload?.email;
  const phone = payload?.phone;
  if (typeof email === 'string') buyerModel.setEmail(email);
  if (typeof phone === 'string') buyerModel.setPhone(phone);
});

const handleCheckoutFinal = async (payload: any) => {
  const email = payload?.email;
  const phone = payload?.phone;
  if (!email || !phone) return;

  buyerModel.setEmail(email);
  buyerModel.setPhone(phone);

  const buyerData = getBuyerSafe();
  const order: OrderRequest = {
    items: cartModel.getItem().map(p => p.id),
    payment: String(buyerData.payment),
    address: buyerData.address,
    email: buyerData.email,
    phone: buyerData.phone,
    total: cartModel.getTotalPrice() ?? 0
  };

  try {
    const res = await api.sendOrder(order);
    console.log('Заказ успешно отправлен:', res);
    const total = cartModel.getTotalPrice() ?? 0;
    cartModel.clear();
    buyerModel.clear();

    successView.update(total);
    modal.open(successView.render());
  } catch (err) {
    console.error('Ошибка при отправке заказа:', err);
    events.emit('order:send:error', { message: 'Ошибка отправки заказа. Попробуйте позже.' });
  }
};
events.on('checkout:contacts', handleCheckoutFinal);

events.on('order:success:close', () => {
  modal.close();
  header.setCounter(cartModel.getCount());
});

console.log('App initialized');