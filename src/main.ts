import './scss/styles.scss';
import { EventEmitter } from './components/base/Events';

export const events = new EventEmitter();
import { Products } from './components/Models/products';
import { Carts } from './components/Models/carts';
import { Bayer } from './components/Models/bayers';

import { HeaderView } from './components/views/HeaderView';
import { CatalogView } from './components/views/CatalogView';
import { ModalView } from './components/views/ModalView';

import { Presenter } from './components/presenter/Presenter';

const productsModel = new Products();
const cartModel = new Carts();
const buyerModel = new Bayer();

const headerView = new HeaderView();
const catalogView = new CatalogView();
const modalView = new ModalView();

const presenter = new Presenter({
  productsModel,
  cartModel,
  buyerModel,
  headerView,
  catalogView,
  modalView
});


(async function init() {
  const products = await fetch('/api/products').then(r => r.json()).catch(() => {
    
    return [];
  });

  
  productsModel.saveProducts(products);
})();