import { Product } from "../../api/sagra/sagraSchemas.ts";

export interface IProductsOrder {
  courseId?: number;

  addToOrder(product: Product): void;
}