import { Api } from '../base/Api';
import { IProduct } from '../../types';

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

export interface OrderResponse {
  items: string[];
  payment: string | null;
  address: string;
  email: string;
  phone: string;
  total: number;
}

export class Communication {
	private api: Api;

	constructor(baseUrl: string) {
		this.api = new Api(baseUrl);
	}

	public async fetchProducts(): Promise<ProductListResponse> {
		return await this.api.get<ProductListResponse>('/product/');
	}

	public async sendOrder(order: OrderRequest): Promise<OrderResponse> {
		return await this.api.post<OrderResponse>('/order/', order);
	}
}