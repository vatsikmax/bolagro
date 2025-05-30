import path from "path";
import { COLUMNS, formatDate, TYPES, waitForKeypress } from "../constants";
import { addProductsToCategory, createCategories, getAllProducts, getCategories, getInventoryItemByProduct, getInventotyItems, getSalesChannels, getShippingProfile, getStockLocations, login, postLocationLevelBatch, updateProducts, uploadProductsFile } from "./api";
import { mapToBolagroCategory, mapToBolagroImportProductCsv, mapToBolagroProduct, mapToLocationLevel, mapToUpdateBolagroProduct } from "./mapper";
import { writeToBolagroCsvImportFile } from "./file-helper";

async function handleCategories(token: string, productCategories: any[], torgsoftProducts: any[]) {
  const existingCategoryNames = productCategories.map((pc: { name: any; }) => pc.name);
  const newCategories = torgsoftProducts
    .map((tp: any) => tp[COLUMNS.TYPE.torgsoft])
    .filter((category: any, index: number, self: any[]) => !existingCategoryNames.includes(category) && self.indexOf(category) === index)
    .map((category: any) => mapToBolagroCategory(category));
  const createdProductCategories = await createCategories(newCategories, token)
  return createdProductCategories;
}

export async function importToBolagro(torgsoftProducts: any, uploadsDir: string) {
  console.log('Импорт товаров в магазин Болагро...');
  try {
    const { token } = await login(process.env.BOLAGRO_USER!, process.env.BOLAGRO_PASSWORD!);
    const { sales_channels } = await getSalesChannels(token);
    const { product_categories } = await getCategories(token);
    const { shipping_profiles } = await getShippingProfile(token);
    const { stock_locations } = await getStockLocations(token);
    const existingBolagroProducts: any[] = await getAllProducts(token, 'external_id');

    const createdProductCategories = await handleCategories(token, product_categories, torgsoftProducts);

    const { productsToDelete, productsToUpdate, productsToCreate } = categorizeProducts(
      existingBolagroProducts,
      torgsoftProducts,
      sales_channels[0].id,
      shipping_profiles[0].id
    );

    logProductCounts(productsToDelete, productsToUpdate, productsToCreate);

    const { createdProducts, updatedProducts, deletedProductsIds } = await updateProducts(
      productsToCreate,
      productsToUpdate,
      productsToDelete,
      token
    );

    const createdProductsByCategory = groupProductsByCategory(
      createdProducts,
      createdProducts.map((p: any) => p.id),
      torgsoftProducts,
      COLUMNS.TYPE.torgsoft,
      product_categories,
      createdProductCategories
    );

    await updateCategoriesWithProducts(createdProductsByCategory, token);

    const createdProductsWithInventory = await enrichProductsWithInventory(
      createdProducts,
      torgsoftProducts,
      token
    );

    const updatedProductsWithInventory = await enrichProductsWithInventory(
      updatedProducts,
      torgsoftProducts,
      token
    );

    const createdLocationLevels = mapToLocationLevels(
      createdProductsWithInventory,
      stock_locations[0].id
    );

    const updatedLocationLevels = mapToLocationLevels(
      updatedProductsWithInventory,
      stock_locations[0].id
    );

    await postLocationLevelBatch(createdLocationLevels, updatedLocationLevels, [], token);
  } catch (error) {
    console.error('Ошибка обновления товаров в магазине Болагро', error);
    await waitForKeypress(true);
    process.exit(1);
  }
}

// Helper Functions

function categorizeProducts(
  existingProducts: any[],
  torgsoftProducts: any[],
  salesChannelId: string,
  shippingProfileId: string
) {
  const productsToDelete = existingProducts.filter(
    (bp: any) => !torgsoftProducts.some((tp: any) => tp[COLUMNS.EXTERNAL_ID.torgsoft].toString() === bp.external_id)
  );

  const productsToUpdate = existingProducts
    .filter((ebp: any) =>
      torgsoftProducts.some((tp: any) => ebp.external_id === tp[COLUMNS.EXTERNAL_ID.torgsoft].toString())
    )
    .map((ebp: any) =>
      mapToUpdateBolagroProduct(
        ebp,
        torgsoftProducts.find((tp: any) => ebp.external_id === tp[COLUMNS.EXTERNAL_ID.torgsoft].toString())
      )
    );

  const productsToCreate = torgsoftProducts
    .filter(
      (tp: any) =>
        !existingProducts.some((bp: any) => bp.external_id === tp[COLUMNS.EXTERNAL_ID.torgsoft].toString())
    )
    .map((tp: any) => mapToBolagroProduct(tp, salesChannelId, shippingProfileId));

  return { productsToDelete, productsToUpdate, productsToCreate };
}

function logProductCounts(productsToDelete: any[], productsToUpdate: any[], productsToCreate: any[]) {
  console.log('Товаров будет удалено:', productsToDelete.length);
  console.log('Товаров будет обновлено:', productsToUpdate.length);
  console.log('Товаров будет создано:', productsToCreate.length);
}

function groupProductsByCategory(
  products: any[],
  productIds: any[],
  torgsoftProducts: any[],
  categoryColumn: string,
  productCategories: any[] = [],
  createdCategories: any[] = []
) {
  return products
    .filter((product: any) => productIds.includes(product.id))
    .reduce((acc: any, product: any) => {
      const categoryName = torgsoftProducts.find(
        (tp: any) => tp[COLUMNS.EXTERNAL_ID.torgsoft].toString() === product.external_id.toString()
      )[categoryColumn];

      const categoryId =
        [...productCategories, ...createdCategories].find((pc: any) => pc.name === categoryName)?.id || categoryName;

      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(product.id);
      return acc;
    }, {});
}

async function updateCategoriesWithProducts(
  createdProductsByCategory: any,
  token: string
) {
  const createdByCategory: any = {};
  for (const [category, createdIds] of Object.entries(createdProductsByCategory)) {
    createdByCategory[category] = { created: [] };
    createdByCategory[category].created = createdIds;
  }

  for (const [key, value] of Object.entries(createdByCategory)) {
    const categoryValue = value as { created: string[]; };
    await addProductsToCategory(key, categoryValue.created, [], token);
  }
}

async function enrichProductsWithInventory(products: any[], torgsoftProducts: any[], token: string) {
  const enrichedProducts = [];
  for (const product of products) {
    const inventoryItemId = await getInventoryItemByProduct(product.id, product.variants[0].id, token);
    enrichedProducts.push({
      ...product,
      quantity: torgsoftProducts.find(
        (tp: any) => tp[COLUMNS.EXTERNAL_ID.torgsoft].toString() === product.external_id.toString()
      )[COLUMNS.QUANTITY.torgsoft],
      inventoryItemId: inventoryItemId.variant.inventory_items[0].inventory_item_id,
    });
  }
  return enrichedProducts;
}

function mapToLocationLevels(products: any[], stockLocationId: string) {
  return products.map((product) =>
    mapToLocationLevel(product.inventoryItemId, stockLocationId, product.quantity)
  );
}
