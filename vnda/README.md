# VNDA

VNDA integration for deco.cx.

This app allows integration with VNDA API for e-commerce functionalities.

## Product Management Actions

The following actions have been created for product management based on the VNDA API:

### Products
- **createProduct.ts** - Cria um novo produto no catálogo
- **updateProduct.ts** - Atualiza um produto existente 
- **deleteProduct.ts** - Remove um produto do catálogo
- **getProduct.ts** - Retorna um produto específico
- **listProducts.ts** - Lista produtos do catálogo
- **searchProducts.ts** - Busca produtos com filtros avançados
- **rateProduct.ts** - Avalia um produto
- **updateProductByReference.ts** - Atualiza produto pela referência

### Product Variants
- **variants/createVariant.ts** - Cria uma variante de produto
- **variants/listVariants.ts** - Lista variantes de um produto
- **variants/deleteVariant.ts** - Remove uma variante

### Product Images
- **images/createImage.ts** - Cria uma imagem do produto

All actions follow the VNDA API specification and include proper TypeScript types and documentation.