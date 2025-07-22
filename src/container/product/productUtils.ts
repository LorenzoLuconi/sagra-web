import { Course, Product } from "../../api/sagra/sagraSchemas.ts";

interface IProductsGroupBy {
  products: Product[],
  courses?: Course[]
}

export const productsGroupBy = (props : IProductsGroupBy) => {
  const map = new Map<number, Product[]>();

  // Init
  if ( props.courses && props.courses.length > 0) {
    props.courses.forEach(course => {
      map.set(course.id, []);
    })
  }

  props.products.forEach(product => {
      const products = map.get(product.courseId);
      if (!products) {
        map.set(product.courseId, [product]);
      } else {
        products.push(product);
      }
    }
  )

  //console.log(map);

  return map;
}