
interface IProductsToOrderList {
  departmentId: number;
  card: boolean
}

const ProductsToOrderList = (props : IProductsToOrderList ) => {

  // Elenco dei prodotti filtrati per reparto
  // Per ogni prodotto va visualizzato: nome, prezzo e quantità disponibile
  // Deve essere presente un pulsante per aggiungerlo all'ordine
  // Si può prevedere una visualizzazione come card o come lista (default)
  // I dati non devono essere cachati o cachati solo per funzionalità del componente
}

export default ProductsToOrderList