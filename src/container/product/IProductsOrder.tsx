import { Product } from "../../api/sagra/sagraSchemas.ts";

export interface IProductsOrder {
  products: Product[];
  addToOrder(product: Product): void;
}

export const productAvailable = (product: Product) => {
  return  product.availableQuantity > 0 && ! product.sellLocked;
}
