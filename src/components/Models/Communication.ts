import { Api } from '../base/Api';
import { OrderResponse } from '../../types';
import { OrderRequest } from '../../types';
import { ProductListResponse } from '../../types';

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