import { IProduct } from "../../types";

export class Carts {
    private items: IProduct[] = []; 

    getItems(): IProduct[] {
        return [...this.items];
    }

    addItems(product: IProduct): void {
        this.items.push(product);
    }

    removeItems(product: IProduct): void {
        this.items = this.items.filter(p => p !== product)
    }

    clear(): void {
        this.items = [];
    }

    getTotalPrice(): number | null {
      return this.items.reduce((sum, p) => sum + (p.price ?? 0), 0);
    }

    getCount(): number {
        return this.items.length;
    }

    hasProduct(id: string): boolean {
        return this.items.some(p => p.id === id);
    }
}