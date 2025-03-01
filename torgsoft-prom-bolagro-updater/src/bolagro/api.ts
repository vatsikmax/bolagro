import axios from 'axios';

const AUTH_URL = 'auth/user/emailpass';
const CATEGORIES_URL = 'admin/product-categories';
const PRODUCTS_BATCH_URL = 'admin/products/batch';
const SHIPPTING_URL = 'admin/shipping-profiles';
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
};

export async function login(user: string, password: string) {
  try {
    const response = await axios.post(`${process.env.BOLAGRO_HOST}${AUTH_URL}`, { email: user, password: password }, { headers: {} });
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

async function getCategories(token: string) {
  try {
    const response = await axios.get(`${process.env.BOLAGRO_HOST}${CATEGORIES_URL}`, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
    return response.data;
  } catch (error: any) {
    console.error('Ошибка получения категорий:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function getShippingProfile(token: string) {
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
