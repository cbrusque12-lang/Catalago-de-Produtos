import type {
  ApiResponse,
  IProduct,
  IsNumber,
  NewProduct,
  ProductPreview,
  ProductStatus,
  ReadonlyProduct
} from "../src/product";
import { sortProducts } from "../src/product";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;

type NumberResult = Assert<Equal<IsNumber<number>, "É número">>;
type StringResult = Assert<Equal<IsNumber<string>, "Não é número">>;
type PreviewKeys = Assert<Equal<keyof ProductPreview, "id" | "name" | "price">>;
type NewProductKeys = Assert<Equal<keyof NewProduct, Exclude<keyof IProduct, "id">>>;
type ResponseData = Assert<Equal<ApiResponse<IProduct[]>["data"], IProduct[]>>;

declare const products: IProduct[];
declare const readonlyProduct: ReadonlyProduct;
sortProducts(products, "price");
// @ts-expect-error Campos inexistentes não podem ser usados na ordenação.
sortProducts(products, "description");
// @ts-expect-error O status deve pertencer à união declarada.
const invalidStatus: ProductStatus = "available";
// @ts-expect-error As propriedades de ReadonlyProduct são somente leitura.
readonlyProduct.price = 10;
