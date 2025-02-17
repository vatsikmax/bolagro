"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importToPromByFile = importToPromByFile;
const fs_1 = __importDefault(require("fs"));
const form_data_1 = __importDefault(require("form-data"));
const axios_1 = __importDefault(require("axios"));
const promApiToken = process.env.PROM_API_TOKEN;
const promUrl = 'https://my.prom.ua/api/v1/';
async function importToPromByFile(filePath) {
    console.log('Починаю імпорт файлу в пром', filePath);
    const form = new form_data_1.default();
    form.append('file', fs_1.default.createReadStream(filePath));
    form.append('data', JSON.stringify({
        mark_missing_product_as: "not_available",
        updated_fields: ['name', 'price', "presence", 'quantity_in_stock', 'description', 'group', 'images_urls']
    }));
    const headers = {
        ...form.getHeaders(),
        'Authorization': `Bearer ${promApiToken}`
    };
    try {
        const response = await axios_1.default.post(promUrl + 'products/import_file', form, { headers });
        console.log(response.data);
    }
    catch (error) {
        console.error('Помилка імпорту файлу:', error.response ? error.response.data : error.message);
        console.log('Будь ласка зайдіть на prom.ua і скасуйте імпорт якщо необхідно');
    }
}
// function fetchByExternalId(externalId: string): void {
//   const response = request('GET', promUrl + `products/get_by_external_id?external_id=${externalId}`, {
//       headers: {  'Authorization': `Bearer ${promApiToken}` },
//   });
//   const responseBody = JSON.parse(response.getBody('utf8'));
//   console.log('РЕЗУЛЬТАТ ЗАПИТУ:\n', responseBody);
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
//   console.log('РЕЗУЛЬТАТ ОНОВЛЕННЯ:\n', responseBody);
// }
