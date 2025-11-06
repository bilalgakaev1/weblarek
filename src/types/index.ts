
export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export type TPayment = "card" | "cash" | null;

export type ContactsPayload = {
  email: string;
  phone: string;
}

export type OrderStep1Payload = {
  paymentMethod: TPayment;
  address: string;
}

export type payment = { payment: TPayment }

export type address = { address: string }

export type ProductIdPayload = { productId: string };

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
} 

export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
} 

export interface OrderResponse {
  items: string[];
  payment: string | null;
  address: string;
  email: string;
  phone: string;
  total: number;
}

export interface ProductListResponse {
  items: IProduct[];
}

export interface OrderRequest {
  payment: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[]; 
}