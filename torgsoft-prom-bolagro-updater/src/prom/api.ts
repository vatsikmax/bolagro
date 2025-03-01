import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

const promUrl = 'https://my.prom.ua/api/v1/';

export async function importToPromByFile(filePath: string, promApiToken: string): Promise<void> {
  console.log('Начинаю импорт файла в пром', filePath);
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('data', JSON.stringify({
    mark_missing_product_as: "not_available",
    updated_fields:
      ['name', 'price', "presence", 'quantity_in_stock', 'description', 'group', 'images_urls']
  }));
  const headers = {
    ...form.getHeaders(),
    'Authorization': `Bearer ${promApiToken}`
  };
  try {
    const response = await axios.post(promUrl + 'products/import_file', form, { headers });
    console.log(response.data);
  } catch (error: any) {
    console.error('Ошибка импорта файла:', error.response ? error.response.data : error.message);
    console.log('Пожалуйста, зайдите на prom.ua и отмените импорт, если необходимо')
    throw error;
  }
}

// function fetchByExternalId(externalId: string): void {
//   const response = request('GET', promUrl + `products/get_by_external_id?external_id=${externalId}`, {
//       headers: {  'Authorization': `Bearer ${promApiToken}` },
//   });
//   const responseBody = JSON.parse(response.getBody('utf8'));
//   console.log('РЕЗУЛЬТАТ ЗАПРОСА:\n', responseBody);
// }

// function updateProductViaApi(externalId: string, name: string): void {
//   const body = 
//       [
//         {
//           "id": `${externalId}`,
//           // "presence": parseInt(product[COLUMNS.QUANTITY.torgsoft], 10) > 0 ? "available" : "not_available",
//           // "price": parseFloat(product[COLUMNS.PRICE.torgsoft]).toFixed(2),
//           // "status": "on_display",
//           "name": `${name}`,
//           // "description": product[COLUMNS.DESCRIPTIONS.torgsoft],
//           // "quantity_in_stock": parseInt(product[COLUMNS.QUANTITY.torgsoft]),
//           // "measure_unit": product[COLUMNS.UNIT_OF_MEASUREMENT.torgsoft],
//           // "main_image": product[COLUMNS.LINK_TO_IMAGE.torgsoft]
//         }
//       ]
//   const response = request('POST', promUrl + 'products/edit_by_external_id', {
//       headers: {  'Authorization': `Bearer ${promApiToken}` },
//       body: JSON.stringify(body),
//   });
//   const responseBody = JSON.parse(response.getBody('utf8'));
//   console.log('РЕЗУЛЬТАТ ОБНОВЛЕНИЯ:\n', responseBody);
// }