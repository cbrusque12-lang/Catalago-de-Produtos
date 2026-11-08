"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = exports.InventoryService = exports.Category = exports.ProductFactory = exports.Product = void 0;
exports.sortProducts = sortProducts;
exports.getStatusMessage = getStatusMessage;
class Product {
    id;
    name;
    price;
    category;
    stock;
    status;
    constructor(id, name, price, category, stock, status) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.stock = stock;
        this.status = status;
    }
    calculateFinalPrice(discount) {
        if (!Number.isFinite(discount) || discount < 0 || discount > 1) {
            throw new RangeError("O desconto deve estar entre 0 e 1.");
        }
        return this.price * (1 - discount);
    }
}
exports.Product = Product;
class ProductFactory {
    static currentId = 1;
    static generateId() {
        return this.currentId++;
    }
}
exports.ProductFactory = ProductFactory;
var Category;
(function (Category) {
    Category["NOTEBOOK"] = "Notebook";
    Category["SMARTPHONE"] = "Smartphone";
    Category["ACESSORIO"] = "Acess\u00F3rio";
    Category["GAMER"] = "Gamer";
})(Category || (exports.Category = Category = {}));
function sortProducts(products, field) {
    return [...products].sort((a, b) => {
        const first = a[field];
        const second = b[field];
        if (typeof first === "number" && typeof second === "number") {
            return first - second;
        }
        return String(first).localeCompare(String(second), "pt-BR");
    });
}
function getStatusMessage(status) {
    switch (status) {
        case "active":
            return "Produto ativo";
        case "inactive":
            return "Produto inativo";
        case "out_of_stock":
            return "Produto sem estoque";
        default: {
            const exhaustiveCheck = status;
            return exhaustiveCheck;
        }
    }
}
class InventoryService {
    updateStock(product, quantity) {
        if (!Number.isSafeInteger(quantity)) {
            throw new RangeError("A alteração de estoque deve ser um inteiro seguro.");
        }
        const newStock = product.stock + quantity;
        if (!Number.isSafeInteger(newStock) || newStock < 0) {
            throw new RangeError("O estoque resultante deve ser um inteiro seguro não negativo.");
        }
        product.stock = newStock;
        if (newStock === 0) {
            product.status = "out_of_stock";
        }
        else if (product.status === "out_of_stock") {
            product.status = "active";
        }
    }
}
exports.InventoryService = InventoryService;
class ProductRepository {
    products = new Map();
    create(item) {
        if (this.products.has(item.id)) {
            throw new Error(`Já existe um produto com o ID ${item.id}.`);
        }
        this.products.set(item.id, { ...item });
    }
    findById(id) {
        const product = this.products.get(id);
        return product === undefined ? undefined : { ...product };
    }
    findAll() {
        return Array.from(this.products.values(), product => ({ ...product }));
    }
    update(item) {
        if (!this.products.has(item.id)) {
            throw new Error(`Produto com ID ${item.id} não encontrado.`);
        }
        this.products.set(item.id, { ...item });
    }
    delete(id) {
        if (!this.products.delete(id)) {
            throw new Error(`Produto com ID ${id} não encontrado.`);
        }
    }
}
exports.ProductRepository = ProductRepository;
//# sourceMappingURL=product.js.map