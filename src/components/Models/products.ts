import { IProduct } from "../../types";
import { events } from "../base/Events";

export class Products {
    private products: IProduct[] = [];
    private selectedProdust: IProduct | null = null;

    saveProducts(products: IProduct[]): void {
        this.products = products;
        events.emit('catalog:updated', this.products);
    }

    getProducts(): IProduct[] {
        return this.products;
    }

    getProductById(id: string): IProduct | undefined {
        return this.products.find(product => product.id === id);
    }

    setSelectedProduct(product: IProduct): void {
        this.selectedProdust = product;
    }

    getSelectedProduct(): IProduct | null {
        return this.selectedProdust;
    }
}