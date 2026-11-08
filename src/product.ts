export type ProductStatus = "active" | "inactive" | "out_of_stock";

export interface IProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: ProductStatus;
}

export interface IRepository<T> {
  create(item: T): void;
  findById(id: number): T | undefined;
  findAll(): T[];
  update(item: T): void;
  delete(id: number): void;
}

export class Product implements IProduct {
  constructor(
    public id: number,
    public name: string,
    public price: number,
    public category: string,
    public stock: number,
    public status: ProductStatus
  ) {}

  calculateFinalPrice(discount: number): number {
    if (!Number.isFinite(discount) || discount < 0 || discount > 1) {
      throw new RangeError("O desconto deve estar entre 0 e 1.");
    }

    return this.price * (1 - discount);
  }
}

export class ProductFactory {
  private static currentId = 1;

  static generateId(): number {
    return this.currentId++;
  }
}

export enum Category {
  NOTEBOOK = "Notebook",
  SMARTPHONE = "Smartphone",
  ACESSORIO = "Acessório",
  GAMER = "Gamer"
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export type OptionalProduct = Partial<IProduct>;
export type ReadonlyProduct = Readonly<IProduct>;
export type ProductPreview = Pick<IProduct, "id" | "name" | "price">;
export type NewProduct = Omit<IProduct, "id">;
export type IsNumber<T> = T extends number ? "É número" : "Não é número";

export function sortProducts(
  products: readonly IProduct[],
  field: keyof IProduct
): IProduct[] {
  return [...products].sort((a, b) => {
    const first = a[field];
    const second = b[field];

    if (typeof first === "number" && typeof second === "number") {
      return first - second;
    }

    return String(first).localeCompare(String(second), "pt-BR");
  });
}

export function getStatusMessage(status: ProductStatus): string {
  switch (status) {
    case "active":
      return "Produto ativo";
    case "inactive":
      return "Produto inativo";
    case "out_of_stock":
      return "Produto sem estoque";
    default: {
      const exhaustiveCheck: never = status;
      return exhaustiveCheck;
    }
  }
}

export class InventoryService {
  updateStock(product: Product, quantity: number): void {
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
    } else if (product.status === "out_of_stock") {
      product.status = "active";
    }
  }
}

export class ProductRepository implements IRepository<IProduct> {
  private readonly products = new Map<number, IProduct>();

  create(item: IProduct): void {
    if (this.products.has(item.id)) {
      throw new Error(`Já existe um produto com o ID ${item.id}.`);
    }
    this.products.set(item.id, { ...item });
  }

  findById(id: number): IProduct | undefined {
    const product = this.products.get(id);
    return product === undefined ? undefined : { ...product };
  }

  findAll(): IProduct[] {
    return Array.from(this.products.values(), product => ({ ...product }));
  }

  update(item: IProduct): void {
    if (!this.products.has(item.id)) {
      throw new Error(`Produto com ID ${item.id} não encontrado.`);
    }
    this.products.set(item.id, { ...item });
  }

  delete(id: number): void {
    if (!this.products.delete(id)) {
      throw new Error(`Produto com ID ${id} não encontrado.`);
    }
  }
}
