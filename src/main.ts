import './scss/styles.scss';

import { events } from './components/base/Events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { API_URL } from './utils/constants';

import { Products } from './components/Models/products';
import { Carts } from './components/Models/carts';
import { Buyer } from './components/Models/bayers';
import { Communication, OrderRequest } from './components/Models/Communication';

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

events.on('product:open', (payload: any) => {
  const productId = payload?.productId;
  if (!productId) return;
  const product = productsModel.getProductById(productId);
  if (!product) return;

  const tplClone = cloneTemplate('#card-preview');
  const preview = new CardPreviewView(tplClone);
  const isInCart = cartModel.hasProduct(productId);
  const el = preview.render(product, isInCart);
  modal.open(el);
});

events.on('product:add', (payload: any) => {
  const productId = payload?.productId;
  if (!productId) return;
  const product = productsModel.getProductById(productId);
  if (!product) return;
  cartModel.addItem(product);
  modal.close();
});

events.on('product:remove', (payload: any) => {
  const productId = payload?.productId;
  if (!productId) return;
  const product = cartModel.getItem().find((p) => p.id === productId);
  if (!product) return;
  cartModel.removeItem(product);
  modal.close();
});

events.on('cart:open', () => {
  const basketTpl = ensureElement<HTMLTemplateElement>('#basket');
  const basketView = new BasketView(basketTpl);
  basketView.setItems(cartModel.getItem());
  modal.open(basketView.render());
});

events.on('cart:item:remove', (payload: any) => {
  const productId = payload?.productId;
  if (!productId) return;

  const product = cartModel.getItem().find((p) => p.id === productId);
  if (!product) return;

  cartModel.removeItem(product);

  const basketTpl = ensureElement<HTMLTemplateElement>('#basket');
  const basketView = new BasketView(basketTpl);
  basketView.setItems(cartModel.getItem());
  modal.open(basketView.render());
});

events.on('cart:changed', () => {
  header.setCounter(cartModel.getCount());
});

events.on('cart:checkout', () => {
  const orderTpl = ensureElement<HTMLTemplateElement>('#order');
  const orderView = new OrderView(orderTpl);
  modal.open(orderView.render());
});

events.on('order:step1', (payload: any) => {
  const paymentMethod = payload?.paymentMethod;
  const address = payload?.address;
  if (!paymentMethod || !address) return;

  buyerModel.setPayment(paymentMethod);
  buyerModel.setAddress(address);

  const contactsTpl = ensureElement<HTMLTemplateElement>('#contacts');
  const contactsView = new ContactsView(contactsTpl);
  modal.open(contactsView.render());
});

events.on('checkout:step2', async (payload: any) => {
  const email = payload?.email;
  const phone = payload?.phone;
  if (!email || !phone) return;

  buyerModel.setEmail(email);
  buyerModel.setPhone(phone);

  const buyerData = buyerModel.getData();

  const order = {
  items: cartModel.getItem().map(p => p.id),
  payment: buyerData.payment,
  address: buyerData.address,
  email: buyerData.email,
  phone: buyerData.phone,
  total: cartModel.getTotalPrice() ?? 0
};

  try {
    const res = await api.sendOrder(order as OrderRequest);
    console.log('Заказ успешно отправлен:', res);
  } catch (err) {
    console.error('Ошибка при отправке заказа:', err);
  }

  const total = cartModel.getTotalPrice() ?? 0;
  cartModel.clear();
  buyerModel.clear();

  const successTpl = ensureElement<HTMLTemplateElement>('#success');
  const successView = new SuccessView(successTpl);
  successView.update(total);
  modal.open(successView.render());
});

events.on('order:success:close', () => {
  modal.close();
  header.setCounter(cartModel.getCount());
});

console.log('App initialized');