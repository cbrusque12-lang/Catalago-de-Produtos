# Módulo tipado de catálogo de produtos

Este projeto reúne um módulo TypeScript de modelagem e operações de catálogo,
sem interface gráfica, banco de dados ou API real.

## Estrutura do projeto

```text
Catalago de Produtos\
|-- src\
|   |-- index.ts          # Exemplo de criação e cadastro de um produto
|   `-- product.ts        # Tipos, interfaces, classes e regras do catálogo
|-- tests\
|   |-- product.test.cjs  # Testes de comportamento com node:test
|   |-- types.ts          # Testes de tipagem e erros esperados
|   `-- tsconfig.json     # Configuração da verificação de tipos dos testes
|-- dist\                # JavaScript, declarações de tipos e source maps gerados
|-- node_modules\        # Dependências instaladas pelo npm
|-- package.json         # Metadados, dependências e comandos do projeto
|-- package-lock.json    # Registro das versões exatas das dependências
|-- tsconfig.json        # Configuração da compilação TypeScript
|-- README.md            # Documentação do projeto
|-- .gitignore           # Arquivos e diretórios ignorados pelo Git
`-- .gitattributes       # Regras de tratamento de arquivos pelo Git
```

O arquivo `src\product.ts` concentra os contratos (`IProduct`, `IRepository<T>`
e `ApiResponse<T>`), as classes de produto, fábrica, estoque e repositório em
memória, além dos tipos auxiliares, categorias e funções de ordenação e mensagens
de status. `src\index.ts` demonstra o uso do módulo.

As pastas `node_modules` e `dist` são geradas, respectivamente, pela instalação
das dependências e pela compilação.

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

## Experimentar no terminal

Após `npm run build`, execute `node` na pasta do projeto. No prompt `>`, digite
os comandos abaixo, um por vez:

```javascript
const { Category, InventoryService, Product, ProductFactory, ProductRepository } = require("./dist/product.js")
const product = new Product(ProductFactory.generateId(), "Notebook", 3000, Category.NOTEBOOK, 5, "active")
const repository = new ProductRepository()
repository.create(product)
repository.findAll()
product.calculateFinalPrice(0.1)
new InventoryService().updateStock(product, -2)
repository.update(product)
repository.findById(product.id)
```

O preço com desconto é `2700` e o estoque após a atualização é `3`. O Node
exibe `undefined` para comandos que não retornam um valor, como `create` e
`update`; isso não indica erro. Digite `.exit` para sair. Os produtos ficam
somente em memória e são perdidos ao encerrar o Node.

Para criar 3 produtos e inseri-los no repositório, execute:

```javascript
const { Product, ProductFactory, ProductRepository, Category } = require('./dist/product.js')

const repositorio = new ProductRepository()

const produtos = [
  new Product(ProductFactory.generateId(), 'Notebook', 3000, Category.NOTEBOOK, 5, 'active'),
  new Product(ProductFactory.generateId(), 'Smartphone', 1800, Category.SMARTPHONE, 10, 'active'),
  new Product(ProductFactory.generateId(), 'Mouse Gamer', 150, Category.GAMER, 3, 'active')
]

produtos.forEach(produto => repositorio.create(produto))

repositorio.findAll()
```

## Outra maneira de experimentar no terminal

Usar o Copilot do Github e digitar comandos para testar o aplicativo e o próprio Copilot já vai explicando o que está acontecendo durante a execução do comando. Vejam alguns outros exemplos.

Para alterar o estoque e salvar a alteração no repositório:

```javascript
new InventoryService().updateStock(produto, -2)
repositorio.update(produto)
repositorio.findById(produto.id)
```
Para remover:

```javascript
repositorio.delete(produto.id)
```

## Modelagem e uso

O módulo está em `src/product.ts`. `IProduct` define os dados, `Product`
implementa essa interface e adiciona o cálculo de preço, e `ProductStatus`
restringe os status possíveis. `Category` fornece categorias conhecidas;
`category` permanece `string` para permitir categorias adicionais.

O exemplo a seguir é TypeScript para um arquivo dentro de `src`, não para
colar no prompt do Node. O caminho `./product` é relativo a esse arquivo.

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

## Contratos e organização

Os contratos definem os dados e as operações que uma estrutura deve oferecer,
sem implementar seu funcionamento. Neste projeto, são declarados como interfaces
em `src\product.ts`:

| Interface | Contrato |
|
| `IProduct` | Define os campos `id`, `name`, `price`, `category`, `stock` e `status` de um produto. |
| `IRepository<T>` | Define as operações de cadastro, consulta, atualização e remoção de itens do tipo `T`. |
| `ApiResponse<T>` | Define uma resposta com `success: boolean` e `data: T`, sem realizar chamadas de API. |

O parâmetro genérico `T` permite reutilizar um contrato com diferentes tipos.
Em `IRepository<IProduct>`, por exemplo, os itens são produtos; em
`ApiResponse<IProduct[]>`, os dados da resposta são uma lista de produtos.

O contrato do repositório declara estas operações:

```typescript
export interface IRepository<T> {
  create(item: T): void;
  findById(id: number): T | undefined;
  findAll(): T[];
  update(item: T): void;
  delete(id: number): void;
}
```

Na implementação `ProductRepository`, `create` rejeita IDs duplicados,
`findById` retorna um produto ou `undefined`, e `findAll` retorna uma lista,
que pode estar vazia. `update` substitui os dados do produto com o mesmo ID;
`delete` remove esse produto. As duas últimas operações lançam erro se o ID
não existir. O retorno `void` indica que o método não retorna um valor útil.

As declarações `Product implements IProduct` e
`ProductRepository implements IRepository<IProduct>` permitem ao TypeScript
verificar se as classes atendem aos respectivos contratos. As interfaces são
removidas na compilação e não validam dados durante a execução.

A organização atual separa responsabilidades dentro do mesmo módulo:
`Product` representa o produto e calcula descontos; `ProductFactory` gera IDs;
`InventoryService` aplica as regras de estoque; e `ProductRepository` armazena
os produtos em memória. `src\index.ts` demonstra o uso, enquanto `tests` reúne
as verificações de comportamento e de tipos.

Essa separação permite criar outra implementação de repositório mantendo o
contrato. Uma integração com banco de dados ou API pode exigir adaptar os
retornos da interface para operações assíncronas com `Promise`.

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
