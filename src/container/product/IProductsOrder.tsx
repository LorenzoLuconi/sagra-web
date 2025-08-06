import { Product } from "../../api/sagra/sagraSchemas.ts";
import {ProductsSearchQueryParams} from "../../api/sagra/sagraComponents.ts";

export interface IProductsOrder {
  searchParam: ProductsSearchQueryParams
  addToOrder(product: Product): void;
}