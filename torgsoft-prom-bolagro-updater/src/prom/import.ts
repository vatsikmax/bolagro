import { COLUMNS, TYPES, waitForKeypress } from "../constants";
import { importToPromByFile } from "./api";
import { writeToPromXlsxImportFile } from "./file-helper";

function mapToPromImportProduct(torgsoftProduct: any) {
  const quantity = (typeof torgsoftProduct[COLUMNS.QUANTITY.torgsoft] === 'number' ? Math.floor(torgsoftProduct[COLUMNS.QUANTITY.torgsoft]) : Math.floor(Number(torgsoftProduct[COLUMNS.QUANTITY.torgsoft].replace(', ', '.'))));
  const price = typeof torgsoftProduct[COLUMNS.PRICE.torgsoft] === 'number' ? torgsoftProduct[COLUMNS.PRICE.torgsoft] : Number(torgsoftProduct[COLUMNS.PRICE.torgsoft].replace(',', '.'));
  const unitOfMeasurement = torgsoftProduct[COLUMNS.UNIT_OF_MEASUREMENT.torgsoft].trim() === '' ? 'шт.' : torgsoftProduct[COLUMNS.UNIT_OF_MEASUREMENT.torgsoft].trim();
  const linkToImage = torgsoftProduct[COLUMNS.LINK_TO_IMAGE.torgsoft] ? torgsoftProduct[COLUMNS.LINK_TO_IMAGE.torgsoft]
    .replace(/_x000d_/g, '')  // Remove _x000d_
    .replace(/\r/g, '')       // Remove any leftover carriage returns
    .replace(/\n{2,}/g, '\n') // Remove excessive new lines (if any)
    .trim() : undefined;
  const description = torgsoftProduct[COLUMNS.DESCRIPTIONS.torgsoft] ? torgsoftProduct[COLUMNS.DESCRIPTIONS.torgsoft]
    .replace(/_x000d_/g, '')  // Remove _x000d_
    .replace(/\r/g, '')       // Remove any leftover carriage returns
    .replace(/\n{2,}/g, '\n') // Remove excessive new lines (if any)
    .trim() : undefined;
  return {
    [COLUMNS.NAME.prom]: torgsoftProduct[COLUMNS.NAME.torgsoft],
    [COLUMNS.NAME_UKR.prom]: torgsoftProduct[COLUMNS.NAME.torgsoft],
    [COLUMNS.DESCRIPTIONS.prom]: description,
    [COLUMNS.DESCRIPTIONS_UKR.prom]: description,
    [COLUMNS.PRICE.prom]: price,
    [COLUMNS.UNIT_OF_MEASUREMENT.prom]: unitOfMeasurement,
    [COLUMNS.LINK_TO_IMAGE.prom]: linkToImage,
    [COLUMNS.QUANTITY.prom]: quantity,
    [COLUMNS.EXTERNAL_ID.prom]: torgsoftProduct[COLUMNS.EXTERNAL_ID.torgsoft],
    [COLUMNS.MANUFACTURER.prom]: torgsoftProduct[COLUMNS.MANUFACTURER.torgsoft] !== 'НЕТ ИНФОРМАЦИИ' ? torgsoftProduct[COLUMNS.MANUFACTURER.torgsoft] : '',
    [COLUMNS.COUNTRY.prom]: torgsoftProduct[COLUMNS.COUNTRY.torgsoft] !== 'НЕТ ИНФОРМАЦИИ' ? torgsoftProduct[COLUMNS.COUNTRY.torgsoft] : '',
    [COLUMNS.CURRENCY.prom]: 'UAH',
    [COLUMNS.TYPE.prom]: Object.values(TYPES).find(type => torgsoftProduct[COLUMNS.TYPE.torgsoft].includes(type.torgsoft))?.prom,
    [COLUMNS.GROUP_NAME.prom]: Object.values(TYPES).find(type => torgsoftProduct[COLUMNS.TYPE.torgsoft].includes(type.torgsoft))?.ua,
    [COLUMNS.GROUP_NUMBER.prom]: Object.values(TYPES).find(type => torgsoftProduct[COLUMNS.TYPE.torgsoft].includes(type.torgsoft))?.id,
    [COLUMNS.CELL_TYPE.prom]: 'r',
    [COLUMNS.AVAILABILITY.prom]: quantity > 0 ? '+' : '-'
  };
}


function getGroups() {
  return Object.values(TYPES).map(type => {
    return {
      "Назва_групи": type.ru,
      "Назва_групи_укр": TYPES.SEEDS.ua,
      [COLUMNS.GROUP_NUMBER.prom]: type.id,
    }
  });
}

export async function importToProm(filteredProducts: any, importPromFile: string) {
  const promImportProducts = filteredProducts.map((tp: any) => {
    return mapToPromImportProduct(tp);
  });
  try {
    await writeToPromXlsxImportFile(importPromFile, promImportProducts, getGroups());
  } catch (error) {
    console.error('Ошибка записи в файл для prom.ua:', error);
    await waitForKeypress(true);
    process.exit(1);
  }

  try {
    await importToPromByFile(importPromFile, '3ef17956b8d9ef96362bbd2674d2b578ce39bded');
  } catch (error) {
    await waitForKeypress(true);
    process.exit(1);
  }

}