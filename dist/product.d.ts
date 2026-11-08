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
export declare class Product implements IProduct {
    id: number;
    name: string;
    price: number;
    category: string;
    stock: number;
    status: ProductStatus;
    constructor(id: number, name: string, price: number, category: string, stock: number, status: ProductStatus);
    calculateFinalPrice(discount: number): number;
}
export declare class ProductFactory {
    private static currentId;
    static generateId(): number;
}
export declare enum Category {
    NOTEBOOK = "Notebook",
    SMARTPHONE = "Smartphone",
    ACESSORIO = "Acess\u00F3rio",
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
export declare function sortProducts(products: readonly IProduct[], field: keyof IProduct): IProduct[];
export declare function getStatusMessage(status: ProductStatus): string;
export declare class InventoryService {
    updateStock(product: Product, quantity: number): void;
}
export declare class ProductRepository implements IRepository<IProduct> {
    private readonly products;
    create(item: IProduct): void;
    findById(id: number): IProduct | undefined;
    findAll(): IProduct[];
    update(item: IProduct): void;
    delete(id: number): void;
}
