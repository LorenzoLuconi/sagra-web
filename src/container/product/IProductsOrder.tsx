import { Product } from "../../api/sagra/sagraSchemas.ts";

export interface IProductsOrder {
  products: Product[];
  addToOrder(product: Product): void;
}