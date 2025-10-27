import { Products } from "../components/Models/products";
import { Carts } from "../components/Models/carts";
import { TPayment } from ".";

export interface AppEvents {
  'catalog:updated': Products[];
  'cart:changed': Carts[];
  'product:selected': Products;
  'order:validated': boolean;

  'product:open': { productId: string };
  'product:add': { productId: string };
  'product:remove': { productId: string };

  'cart:open': void;
  'cart:item:remove': { productId: string };
  'cart:checkout': void;

  'order:paymentChanged': { payment: TPayment };
  'order:addressChanged': { address: string };

  'order:step1': { paymentMethod: TPayment; address: string };
  'contacts:changed': { email: string; phone: string };
  'checkout:step2': { email: string; phone: string };

  'modal:close': void;
  'order:success:close': void;
}

export type TypedEvents = {
  on<K extends keyof AppEvents>(event: K, callback: (data: AppEvents[K]) => void): void;
  emit<K extends keyof AppEvents>(event: K, data: AppEvents[K]): void;
};

