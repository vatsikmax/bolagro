import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const AUTH_URL = 'auth/user/emailpass';
const CATEGORIES_URL = 'admin/product-categories';
const PRODUCTS_BATCH_URL = 'admin/products/batch';
const SHIPPTING_URL = 'admin/shipping-profiles';
const PRODUCTS_IMPORT = 'admin/products/import';
const SALES_CHANNELS = 'admin/sales-channels';
const PRODUCTS = 'admin/products';
const productCategory = (categoryId: string) => `admin/product-categories/${categoryId}/products`;
const productImportConfirm = (id: number) => `admin/products/import/${id}/confirm`;
const INVENTORY_ITEMS = 'admin/inventory-items';
const inventoryItems = (id: string) => `/admin/products/${id}/variants/inventory-items/batch`;
const LOCATION_LEVEL_BATCH = 'admin/inventory-items/location-levels/batch';
const STOCK_LOCATION = 'admin/stock-locations';
const inventoryItemByProduct = (productId: string, variantId: string) => `admin/products/${productId}/variants/${variantId}?fields=inventory_items.inventory_item_id`;
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
};

export async function login(user: string, password: string) {
  try {
    const response = await axios.post(`${process.env.BOLAGRO_HOST}${AUTH_URL}`, { email: user, password: password }, { headers: AUTH_HEADERS });
    return response.data;
  } catch (error: any) {
    console.error('Ошибка авторизации в магазине Болагро:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function createCategories(categories: any[], token: string) {
  const createdCategories: any[] = [];
  try {
    for (const category of categories) {
      const response = await axios.post(`${process.env.BOLAGRO_HOST}${CATEGORIES_URL}`, category, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
      createdCategories.push(response.data.product_category);
    }
    console.log('Создано категории:', createdCategories);
    return createdCategories;
  } catch (error: any) {
    console.error('Ошибка создания категорий:', error.message);
    throw error;
  }
}

export async function getInventoryItemByProduct(productId: string, variantId: string, token: string) {
  try {
    console.log(`${process.env.BOLAGRO_HOST}${inventoryItemByProduct(productId, variantId)}`);
    const response = await axios.get(`${process.env.BOLAGRO_HOST}${inventoryItemByProduct(productId, variantId)}`, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
    return response.data;
  } catch (error: any) {
    console.error('Ошибка получения инвентария по продукту:', error.message);
    throw error;
  }
}

export async function getSalesChannels(token: string) {
  try {
    const response = await axios.get(`${process.env.BOLAGRO_HOST}${SALES_CHANNELS}`, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
    return response.data;
  } catch (error: any) {
    console.error('Ошибка получения каналов продаж:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function getStockLocations(token: string) {
  try {
    const response = await axios.get(`${process.env.BOLAGRO_HOST}${STOCK_LOCATION}?limit=1`, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
    return response.data;
  } catch (error: any) {
    console.error('Ошибка получения локаций:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function getCategories(token: string) {
  try {
    const response = await axios.get(`${process.env.BOLAGRO_HOST}${CATEGORIES_URL}`, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
    return response.data;
  } catch (error: any) {
    console.error('Ошибка получения категорий:', error.message);
    throw error;
  }
}

export async function getShippingProfile(token: string) {
  try {
    const response = await axios.get(`${process.env.BOLAGRO_HOST}${SHIPPTING_URL}`, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
    return response.data;
  } catch (error: any) {
    console.error('Ошибка получения профиля доставки:', error.message);
    throw error;
  }
}

export async function postLocationLevelBatch(createLevels: any[], updateLevels: any[], deleteLevels: any[], token: string) {
  const batchSize = 100;
  const createdResponse: any[] = [];
  const updatedResponse: any[] = [];
  const deletedIdsResponse: any[] = [];
  const sendBatch = async (createBatch: any[], updateBatch: any[], deleteBatch: any[]) => {
    try {
      const response = await axios.post(`${process.env.BOLAGRO_HOST}${LOCATION_LEVEL_BATCH}`, {
        create: createBatch,
        update: updateBatch,
        delete: deleteBatch?.map((dp: any) => dp.id)
      }, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
      deletedIdsResponse.push(...response.data.deleted);
      createdResponse.push(...response.data.created);
      updatedResponse.push(...response.data.updated);
    } catch (error: any) {
      console.error('Ошибка добавления уровней локации:', error.message);
      throw error;
    }
  };

  const maxLength = Math.max(createLevels.length, updateLevels.length, deleteLevels.length);

  for (let i = 0; i < maxLength; i += batchSize) {
    const createBatch = createLevels.slice(i, i + batchSize);
    const updateBatch = updateLevels.slice(i, i + batchSize);
    const deleteBatch = deleteLevels.slice(i, i + batchSize);

    if (createBatch.length > 0 || updateBatch.length > 0 || deleteBatch.length > 0) {
      await sendBatch(createBatch, updateBatch, deleteBatch);
    }
  }
  return { created: createdResponse, updated: updatedResponse, deletedIds: deletedIdsResponse };
}

export async function updateProducts(createProducts: any[], updateProducts: any[], deleteProducts: any[], token: string) {
  const batchSize = 100;
  const createdResponse: any[] = [];
  const updatedResponse: any[] = [];
  const deletedIdsResponse: any[] = [];
  const sendBatch = async (createBatch: any[], updateBatch: any[], deleteBatch: any[]) => {
    try {
      const response = await axios.post(`${process.env.BOLAGRO_HOST}${PRODUCTS_BATCH_URL}`, {
        create: createBatch,
        update: updateBatch,
        delete: deleteBatch?.map((dp: any) => dp.id)
      }, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
      deletedIdsResponse.push(...response.data.deleted.ids);
      createdResponse.push(...response.data.created);
      updatedResponse.push(...response.data.updated);
    } catch (error: any) {
      console.error('Ошибка обновления товаров:', error.message);
      throw error;
    }
  };

  const maxLength = Math.max(createProducts.length, updateProducts.length, deleteProducts.length);

  for (let i = 0; i < maxLength; i += batchSize) {
    const createBatch = createProducts.slice(i, i + batchSize);
    const updateBatch = updateProducts.slice(i, i + batchSize);
    const deleteBatch = deleteProducts.slice(i, i + batchSize);

    if (createBatch.length > 0 || updateBatch.length > 0 || deleteBatch.length > 0) {
      await sendBatch(createBatch, updateBatch, deleteBatch);
    }
  }
  return { createdProducts: createdResponse, updatedProducts: updatedResponse, deletedProductsIds: deletedIdsResponse };
}

export async function uploadProductsFile(filePath: string, token: string) {
  const form = new FormData()
  form.append("file", fs.createReadStream(filePath))
  try {
    console.log("Отправка файла на сервер Болагро")
    const importResponse: { data: { transaction_id: number } } = await axios.post(`${process.env.BOLAGRO_HOST}${PRODUCTS_IMPORT}`, form, { headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}` } });
    console.log("Запрос на начало импорта виполнено, ID транзакции:", importResponse.data.transaction_id)
    await axios.post(`${process.env.BOLAGRO_HOST}${productImportConfirm(importResponse.data.transaction_id)}`, {}, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } })
    console.log('Начало импорта подтверждено');
  } catch (error: any) {
    console.error('Ошибка импорта в Болагро:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function getInventotyItems(token: string, fields?: string[]) {
  const limit = 100; // Number of products per request
  let offset = 0;
  let allInventoryItems: any[] = [];
  let hasMore = true;
  while (hasMore) {
    let retries = 0;
    const maxRetries = 5;
    let success = false;

    while (!success && retries < maxRetries) {

      try {
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay between requests

        const response = await axios.get(`${process.env.BOLAGRO_HOST}${INVENTORY_ITEMS}?limit=${limit}&offset=${offset}${fields ? `&fields=${fields.join(',')}` : ''}`, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
        const { inventory_items, count } = response.data;

        allInventoryItems = [...allInventoryItems, ...inventory_items];
        offset += limit;

        // Check if we've fetched all products
        hasMore = offset < count;

        console.log(`Инвентариев найдено ${allInventoryItems.length} из ${count}`);
        success = true;
      } catch (error: any) {
        retries++;
        const isRateLimit = error.response && (error.response.status === 429 || error.response.status === 503);

        if (isRateLimit || retries < maxRetries) {
          // Exponential backoff with jitter
          const baseDelay = 1000; // 1 second
          const maxDelay = 30000; // 30 seconds

          // Calculate exponential backoff: 2^retries * baseDelay
          let delay = Math.min(maxDelay, Math.pow(2, retries) * baseDelay);

          // Add jitter (random value between 0-30% of delay)
          delay = delay + (Math.random() * 0.3 * delay);

          console.log(`Rate limit hit or request failed. Retrying in ${Math.round(delay / 1000)} seconds... (Attempt ${retries} of ${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error('Max retries reached. Stopping fetch process.');
          hasMore = false;
          throw error;
        }
      }
    }
    if (retries >= maxRetries) {
      console.error('Max retries reached for current batch. Moving to next batch.');
    }

  }
  return allInventoryItems;
}

export async function postInventoryItems(id: string, variantPerInventoryMap: [], token: string) {
  try {
    const response = await axios.post(`${process.env.BOLAGRO_HOST}${inventoryItems(id)}`, { create: variantPerInventoryMap }, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
    return response.data;
  } catch (error: any) {
    console.error('Ошибка добавления товара:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function addProductsToCategory(categoryId: string, productToAddIds: string[], productToRemoveIds: string[], token: string) {
  try {
    const response = await axios.post(
      `${process.env.BOLAGRO_HOST}${productCategory(categoryId)}`,
      { add: productToAddIds, remove: productToRemoveIds },
      { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Ошибка добавления товаров в категорию:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function getAllProducts(token: string, fields: string) {
  const limit = 100; // Number of products per request
  let offset = 0;
  let allProducts: any[] = [];
  let hasMore = true;
  while (hasMore) {
    let retries = 0;
    const maxRetries = 5;
    let success = false;

    while (!success && retries < maxRetries) {

      try {
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay between requests

        const response = await axios.get(`${process.env.BOLAGRO_HOST}${PRODUCTS}?limit=${limit}&offset=${offset}&fields=${fields}`, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });

        const { products, count } = response.data;

        allProducts = [...allProducts, ...products];
        offset += limit;

        // Check if we've fetched all products
        hasMore = offset < count;

        console.log(`Продуктов найдено ${allProducts.length} из ${count} продуктов`);
        success = true;
      } catch (error: any) {
        retries++;
        const isRateLimit = error.response && (error.response.status === 429 || error.response.status === 503);

        if (isRateLimit || retries < maxRetries) {
          // Exponential backoff with jitter
          const baseDelay = 1000; // 1 second
          const maxDelay = 30000; // 30 seconds

          // Calculate exponential backoff: 2^retries * baseDelay
          let delay = Math.min(maxDelay, Math.pow(2, retries) * baseDelay);

          // Add jitter (random value between 0-30% of delay)
          delay = delay + (Math.random() * 0.3 * delay);

          console.log(`Rate limit hit or request failed. Retrying in ${Math.round(delay / 1000)} seconds... (Attempt ${retries} of ${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error('Max retries reached. Stopping fetch process.');
          hasMore = false;
          throw error;
        }
      }
    }
    if (retries >= maxRetries) {
      console.error('Max retries reached for current batch. Moving to next batch.');
    }

  }
  return allProducts;
}