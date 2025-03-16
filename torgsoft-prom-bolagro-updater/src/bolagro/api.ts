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
const productImportConfirm = (id: number) => `admin/products/import/${id}/confirm`;
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
  const bolagroCategories = categories.map((category) => ({
    name: category.ru,
    is_active: true,
    handle: category.handle,
  }));

  try {
    for (const category of bolagroCategories) {
      await axios.post(`${process.env.BOLAGRO_HOST}${CATEGORIES_URL}`, category, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
    }
  } catch (error: any) {
    console.error('Ошибка создания категорий:', error.response ? error.response.data : error.message);
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

export async function getCategories(token: string) {
  try {
    const response = await axios.get(`${process.env.BOLAGRO_HOST}${CATEGORIES_URL}`, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
    return response.data;
  } catch (error: any) {
    console.error('Ошибка получения категорий:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function getShippingProfile(token: string) {
  try {
    const response = await axios.get(`${process.env.BOLAGRO_HOST}${SHIPPTING_URL}`, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
    return response.data;
  } catch (error: any) {
    console.error('Ошибка получения профиля доставки:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function updateProducts(products: any, token: string) {
  const { product_categories } = await getCategories(token);
  const { shipping_profiles } = await getShippingProfile(token);
  const bolagroProducts = products.map((product: any) => ({
    title: product.name,
    categories: [
      {
        id: product_categories.find((cat: any) => cat.name === product.category)!.id,
      }
    ],
    description: product.description,
    status: 'published',
    shipping_profile_id: shipping_profiles[0].id,
    options: [
      {
        title: "Measurement",
        values: ["кг.", "л", "шт."]
      }
    ],
    variants: [
      {
        title: "Small package",
        options: {
          Measurement: "шт.",
        },
        prices: [
          {
            amount: 10,
            currency_code: "uah",
          },
        ],
      },
    ],
  }));

  try {
    const response = await axios.post(`${process.env.BOLAGRO_HOST}${PRODUCTS_BATCH_URL}`, { create: [bolagroProducts[0]] }, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
    console.log(response.data);
  } catch (error: any) {
    console.error('Ошибка обновления товаров:', error.response ? error.response.data : error.message);
    throw error;
  }
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