# Módulo tipado de catálogo de produtos

Este projeto reúne um módulo TypeScript de modelagem e operações de catálogo,
sem interface gráfica, banco de dados ou API real.

## Ambiente e execução

Requisitos: Node.js 20 ou superior e npm. Na pasta do projeto:

```powershell
npm ci
npm run build
npm run typecheck
npm test
```

O build gera JavaScript CommonJS e declarações de tipos em `dist`. O comando
`typecheck` verifica também os exemplos de erros de tipos esperados. `test`
executa o build, a verificação de tipos e os testes de execução com `node:test`.

## Modelagem e uso

O módulo está em `src/product.ts`. `IProduct` define os dados, `Product`
implementa essa interface e adiciona o cálculo de preço, e `ProductStatus`
restringe os status possíveis. `Category` fornece categorias conhecidas;
`category` permanece `string` para permitir categorias adicionais.

```typescript
import {
  Category, InventoryService, Product, ProductFactory, ProductRepository,
  sortProducts, type ApiResponse, type IProduct
} from "./product";

const product = new Product(
  ProductFactory.generateId(), "Notebook", 3000, Category.NOTEBOOK, 5, "active"
);
new InventoryService().updateStock(product, -2);
const repository = new ProductRepository();
repository.create(product);
const products = sortProducts(repository.findAll(), "price");
const response: ApiResponse<IProduct[]> = { success: true, data: products };
```

`IRepository<T>` e `ApiResponse<T>` reutilizam a mesma estrutura para
diferentes tipos. `Partial`, `Readonly`, `Pick` e `Omit` derivam variações de
`IProduct`; `IsNumber<T>` exemplifica um tipo condicional e `keyof IProduct`
restringe os campos de ordenação. O `never` no `switch` sinaliza em compilação
um status novo que ainda não tenha mensagem.

## Regras e decisões técnicas

- O desconto é uma fração entre 0 e 1, inclusive; valores inválidos geram
  `RangeError`. Os preços usam `number`, sem arredondamento monetário explícito.
- A alteração de estoque deve ser um inteiro seguro e o resultado não pode ser
  negativo. Estoque zero muda o status para `out_of_stock`; uma reposição de
  produto nesse status o torna `active`. Um produto `inactive` permanece
  inativo enquanto seu estoque for positivo.
- O repositório em memória rejeita IDs duplicados e operações de atualização
  ou remoção de IDs inexistentes. Consultas retornam cópias rasas, suficientes
  para o modelo atual de propriedades primitivas; alterações exigem `update`.
- A fábrica gera IDs sequenciais somente durante a execução atual. Ela não
  garante unicidade entre processos, reinicializações ou dados externos.
- A ordenação retorna uma nova lista, numérica para números e textual para
  strings, em ordem crescente. Os objetos da lista não são clonados.
- `strict` e outras verificações do compilador reforçam a tipagem. Valores
  locais evidentes usam inferência; contratos públicos usam tipos explícitos.

Esses tipos não validam dados externos em tempo de execução. O construtor e o
repositório não validam todos os campos: para integrar uma API ou persistência,
valide os dados na fronteira, defina regras para preço e status iniciais e use
uma estratégia durável de IDs. Para dinheiro, avalie centavos inteiros ou uma
biblioteca decimal; operações com ponto flutuante podem causar imprecisão.
`ApiResponse<T>` é apenas um contrato ilustrativo, não uma chamada de API.

## Uso e avaliação crítica de IA

Uma assistência de IA foi utilizada para estruturar o módulo, a documentação e
os testes a partir do código fornecido. As escolhas de comportamento acima são
explícitas e devem ser avaliadas conforme os requisitos reais do negócio.
Tipagem não prova correção em execução: os testes cobrem exemplos importantes,
mas não substituem revisão humana, validação de dados externos ou testes de
integração quando houver uma API ou banco de dados.
