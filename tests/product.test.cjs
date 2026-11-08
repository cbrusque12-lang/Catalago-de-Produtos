const test = require("node:test");
const assert = require("node:assert/strict");
const {
  Category,
  getStatusMessage,
  InventoryService,
  Product,
  ProductFactory,
  ProductRepository,
  sortProducts
} = require("../dist/product.js");

function makeProduct(id = 1, stock = 5, status = "active") {
  return new Product(id, "Notebook", 100, Category.NOTEBOOK, stock, status);
}

test("calcula descontos e rejeita valores fora do intervalo", () => {
  const product = makeProduct();
  assert.equal(product.calculateFinalPrice(0), 100);
  assert.equal(product.calculateFinalPrice(0.25), 75);
  assert.equal(product.calculateFinalPrice(1), 0);
  for (const discount of [-0.1, 1.1, NaN, Infinity]) {
    assert.throws(() => product.calculateFinalPrice(discount), RangeError);
  }
});

test("atualiza estoque, transições de status e rejeita alterações inválidas", () => {
  const service = new InventoryService();
  const product = makeProduct();
  service.updateStock(product, -5);
  assert.equal(product.stock, 0);
  assert.equal(product.status, "out_of_stock");
  service.updateStock(product, 2);
  assert.equal(product.status, "active");
  product.status = "inactive";
  service.updateStock(product, 1);
  assert.equal(product.status, "inactive");
  for (const quantity of [-4, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => service.updateStock(product, quantity), RangeError);
    assert.equal(product.stock, 3);
    assert.equal(product.status, "inactive");
  }
});

test("repositório implementa CRUD e não expõe referências internas", () => {
  const repository = new ProductRepository();
  const product = makeProduct();
  repository.create(product);
  product.name = "Alterado externamente";
  assert.equal(repository.findById(1).name, "Notebook");
  assert.throws(() => repository.create(product), /Já existe/);
  const found = repository.findById(1);
  found.name = "Alterado";
  assert.equal(repository.findAll()[0].name, "Notebook");
  repository.update(found);
  found.name = "Alterado novamente";
  assert.equal(repository.findById(1).name, "Alterado");
  repository.delete(1);
  assert.equal(repository.findById(1), undefined);
  assert.deepEqual(repository.findAll(), []);
  assert.throws(() => repository.update(product), /não encontrado/);
  assert.throws(() => repository.delete(1), /não encontrado/);
});

test("ordena números e textos sem alterar a lista original", () => {
  const products = [
    { ...makeProduct(1), name: "Zebra", price: 100 },
    { ...makeProduct(2), name: "Abacate", price: 20 }
  ];
  assert.deepEqual(sortProducts(products, "price").map(p => p.id), [2, 1]);
  assert.deepEqual(sortProducts(products, "name").map(p => p.id), [2, 1]);
  assert.deepEqual(products.map(p => p.id), [1, 2]);
});

test("gera IDs sequenciais e mensagens para todos os status", () => {
  const first = ProductFactory.generateId();
  assert.equal(ProductFactory.generateId(), first + 1);
  assert.equal(getStatusMessage("active"), "Produto ativo");
  assert.equal(getStatusMessage("inactive"), "Produto inativo");
  assert.equal(getStatusMessage("out_of_stock"), "Produto sem estoque");
});
