import { Product } from "../../api/sagra/sagraSchemas.ts";

export interface IProductsOrder {
  courseId?: number;

  addToOrder(product: Product): void;
}

export const productAvailable = (product: Product) => {
  return  product.availableQuantity > 0 && ! product.sellLocked;
}
