import './scss/styles.scss';
//import { IProduct } from './types';
import { Carts } from './components/Models/carts';
import { Bayer } from './components/Models/bayers';
//import { IBuyer } from './types';
import { Products } from './components/Models/products';
import { apiProducts } from './utils/data';

const product = new Products();
const cart = new Carts();
const me = new Bayer('card', 'Москва', '89626557072', 'bilalgakaev1@gmail.com');

//Проверка класса каталога товаров
product.saveProducts(apiProducts.items);
console.log(`Массив товаров из каталога: `, product.getProducts())
console.log('Вот товар с конкретным id: ', product.getProductById('854cef69-976d-4c2a-a18c-2aa45046c390'))
product.setSelectedProdusct(apiProducts.items[3]);
console.log('Выбранный товар: ', product.getSelectedProduct());

//Проверка класса с карзиной
cart.addItems(apiProducts.items[0]);
cart.addItems(apiProducts.items[3]);
console.log('Товары в корзине: ', cart.getItems());
cart.removeItems(apiProducts.items[0]);
console.log('Обновленные товары в корзине: ', cart.getItems());
cart.clear()
console.log('Очистка корзины: ', cart.getItems());
cart.addItems(apiProducts.items[1]);
console.log('Общая стоимость товаров в корзине', cart.getTotalPrice());
console.log('Всего товаров: ', cart.getCount());
cart.addItems(apiProducts.items[3]);
if (cart.hasProduct('412bcf81-7e75-4e70-bdb9-d3c73c9803b7')) {
    console.log('Товар который вы ищете есть в корзине');
} else {
    console.log('Данного товара в корзине нет!');
}

//Проверка методов покупателя
console.log(me.getData());
console.log('Данные пользователя очищены!', me.clear());
console.log(me.getData());
me.validate();
me.address = 'Ростов';
me.payment = 'cash';
me.email = 'bgakaev@ya.ru';
me.phone = '89387299928';
console.log('Новые данные пользователя: ', me.validate(), me.getData())



