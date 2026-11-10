import {
  Category, InventoryService, Product, ProductFactory, ProductRepository,
  sortProducts, type ApiResponse, type IProduct
} from "./product";

const product = new Product(
  ProductFactory.generateId(), "Notebook", 3000, Category.NOTEBOOK, 5, "active"
);

const repository = new ProductRepository();
repository.create(product);
console.log(repository.findAll());
