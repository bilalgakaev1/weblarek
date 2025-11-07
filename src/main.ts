import './scss/styles.scss';

import { IProduct, ContactsPayload, ProductIdPayload, IBuyer, TPayment, OrderRequest } from './types';
import { events } from './components/base/Events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { API_URL } from './utils/constants';

import { Products } from './components/Models/products';
import { Carts } from './components/Models/carts';
import { Buyer } from './components/Models/bayers';
import { Communication } from './components/Models/Communication';

import { Gallery } from './components/views/Gallery';
import { HeaderView } from './components/views/HeaderView';
import { ModalView } from './components/views/ModalView';
import { CardBasket } from './components/views/CardBasket';
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

type BuyerChangePayload = { key: keyof IBuyer; value: IBuyer[keyof IBuyer] };

events.on<BuyerChangePayload>('buyer:change', (payload) => {
  if (!payload) return;
  const { key, value } = payload;
  buyerModel.change(key, value);
});

function getBuyerSafe(): IBuyer {
  return buyerModel.getData();
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

events.on<ProductIdPayload>('product:open', (payload) => {
  const productId = payload?.productId;
  if (!productId) return;
  const product = productsModel.getProductById(productId);
  if (!product) return;
  productsModel.setSelectedProduct(product);
});

events.on<IProduct>('product:selected', (product) => {
  if (!product) return;
  const tplClone = cloneTemplate('#card-preview');
  const preview = new CardPreviewView(tplClone);
  const isInCart = cartModel.hasProduct(product.id);
  const el = preview.render(product, isInCart);
  modal.open(el);
});

events.on<ProductIdPayload>('product:add', (payload) => {
  const productId = payload?.productId;
  if (!productId) return;
  const product = productsModel.getProductById(productId);
  if (!product) return;
  cartModel.addItem(product);
});

events.on<ProductIdPayload>('product:remove', (payload) => {
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
  const buyerData = getBuyerSafe();
  orderView.update(buyerData);
  modal.open(basketView.render());
});

events.on('cart:changed', () => {
  header.setCounter(cartModel.getCount());

  const items: IProduct[] = cartModel.getItem();

  const nodes: HTMLElement[] = items.map((p, i) => {
    const row = new CardBasket();
    row.update(p, i);
    return row.render();
  });

  const total = cartModel.getTotalPrice();
  basketView.setList(nodes, total)
});

events.on('cart:checkout', () => {
  modal.open(orderView.render());
});

events.on<{ payment: TPayment }>('order:paymentChanged', (payload) => {
  if (!payload) return;
  buyerModel.change('payment', payload.payment);
});
events.on<{ address: string }>('order:addressChanged', (payload) => {
  if (!payload) return;
  buyerModel.change('address', payload.address);
});

events.on('order:delivery', () => {
  const buyerData = getBuyerSafe();
  contactsView.update(buyerData);
  modal.open(contactsView.render());
});

events.on<ContactsPayload>('contacts:changed', (payload) => {
  if (!payload) return;
  if (typeof payload.email === 'string') buyerModel.change('email', payload.email);
  if (typeof payload.phone === 'string') buyerModel.change('phone', payload.phone);
});

events.on('form:validate', (errors: Record<string, string>) => {
  const orderFields = ['address', 'payment'];
  const contactFields = ['email', 'phone'];

  const orderErrors = Object.fromEntries(
    Object.entries(errors).filter(([key]) => orderFields.includes(key))
  );
  const contactErrors = Object.fromEntries(
    Object.entries(errors).filter(([key]) => contactFields.includes(key))
  );

  orderView.showErrors(orderErrors);
  orderView.setSubmitEnabled(Object.keys(orderErrors).length === 0);

  contactsView.showErrors(contactErrors);
  contactsView.setSubmitEnabled(Object.keys(contactErrors).length === 0);
});

const handleCheckoutFinal = async () => {
  const buyerData = getBuyerSafe();
  const items = cartModel.getItem();
  const total = cartModel.getTotalPrice() ?? 0;

  const order: OrderRequest = {
    items: items.map((p: IProduct) => p.id),
    payment: String(buyerData.payment ?? ''),
    address: buyerData.address,
    email: buyerData.email,
    phone: buyerData.phone,
    total
  };

  try {
    const res = await api.sendOrder(order);
    console.log('Заказ успешно отправлен:', res);

    cartModel.clear();
    buyerModel.clear();

    successView.update(total);
    modal.open(successView.render());
  } catch (err) {
    console.error('Ошибка при отправке заказа:', err);
    events.emit('order:send:error', { message: 'Ошибка отправки заказа. Попробуйте позже.' });
  }
};
events.on<ContactsPayload>('checkout:contacts', handleCheckoutFinal);

events.on('order:success:close', () => {
  modal.close();
  header.setCounter(cartModel.getCount());
});

console.log('App initialized');