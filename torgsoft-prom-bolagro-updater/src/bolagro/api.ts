import axios from 'axios';

const AUTH_URL = 'auth/user/emailpass';
const CATEGORIES_URL = 'admin/product-categories';
const PRODUCTS_URL = 'admin/products/batch';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
};

const user = process.env.BOLAGRO_USER;
const password = process.env.BOLAGRO_PASSWORD;

async function login() {
  if (!user || !password) {
    throw new Error('Не вказані дані для авторизації для магазину Болагро');
  }
  try {
    const response = await axios.post(`${process.env.BOLAGRO_HOST}${AUTH_URL}`, { email: user, password: password }, { headers: AUTH_HEADERS });
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error('Помилка авторизації в магазині Болагро:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function createCategories(categories: any[]) {
  const token = await login();
  const bolagroCategories = categories.map((category) => ({
  }));
  //TODO map categoreis to bolagro categories

  try {
    for (const category of categories) {
      const response = await axios.post(`${process.env.BOLAGRO_HOST}${CATEGORIES_URL}`, category, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
      console.log(response.data);
    }
  } catch (error: any) {
    console.error('Помилка створення категорій:', error.response ? error.response.data : error.message);
    throw error;
  }

}

export async function updateProducts(products: any) {
  const token = await login();
  const bolagroProducts = products.map((product) => ({
    title: product.title,
    status: product.status,

    options: product.options.map((option) => ({
      title: option.title,
      values: option.values,
    })),
    variants: product.variants.map((variant) => ({
      title: variant.title,
      prices: variant.prices.map((price) => ({
        currency_code: price.currency_code,
        amount: price.amount,
      })),
      manage_inventory: variant.manage_inventory,
      options: variant.options,
    })),
  }));
  try {
    for (const product of products) {
      const response = await axios.post(`${process.env.BOLAGRO_HOST}${PRODUCTS_URL}`, product, { headers: { ...AUTH_HEADERS, 'Authorization': `Bearer ${token}` } });
      console.log(response.data);
    }
  } catch (error: any) {
    console.error('Помилка оновлення товарів:', error.response ? error.response.data : error.message);
    throw error;
  }

}

curl - X POST 'http://localhost:9000/admin/products' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer {token}' \
--data '{
"title": "T-Shirt",
  "status": "published",
    "options": [
      {
        "title": "Color",
        "values": ["Blue"]
      }
    ],
      "variants": [
        {
          "title": "T-Shirt",
          "prices": [
            {
              "currency_code": "eur",
              "amount": 10
            }
          ],
          "manage_inventory": false,
          "options": {
            "Color": "Blue"
          }
        }
      ]
}'
