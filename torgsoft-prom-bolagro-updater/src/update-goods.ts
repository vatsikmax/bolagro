#!/usr/bin/env node
import 'dotenv/config';
import { readTorgsoftProducts } from './torgsoft/file-helper';
import { writeToBolagroCsvImportFile } from './bolagro/file-helper';
import path from 'path';
import fs from 'fs';
import { createCategories, getAllProducts, getCategories, getSalesChannels, login, updateProducts, uploadProductsFile } from './bolagro/api';
import { COLUMNS, formatDate, TYPES, waitForKeypress } from './constants';
import { mapToBolagroImportProduct } from './bolagro/mapper';
import { importToProm } from './prom/import';

// Add a type declaration for process.pkg
declare global {
  namespace NodeJS {
    interface Process {
      pkg?: any;
    }
  }
}

// Get the directory of the executable
const execDir = process.pkg ? path.dirname(process.execPath) : process.cwd();

// Create a writable stream for the log file
const logFile = fs.createWriteStream(path.join(execDir, 'logs'), { flags: 'a' });

// Override console.log to write to both the console and the log file
const originalConsoleLog = console.log;
console.log = function (message?: any, ...optionalParams: any[]) {
  originalConsoleLog(message, ...optionalParams);
  logFile.write(`${message} ${optionalParams.join(' ')}\n`);
};


async function main() {
  // Find the first XLSX file in the directory
  const filesOnRootLevel = fs.readdirSync(execDir);
  const torgsoftExportFile = filesOnRootLevel.find(file => file.endsWith('.xlsx'));

  if (!torgsoftExportFile) {
    console.error(`Не найдено ни одного XLSX файла в ${execDir}.`);
    await waitForKeypress(true);
    process.exit(1);
  }

  // Create 'uploads' folder if it doesn't exist
  const uploadsDir = path.join(execDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const torgsoftExportFilePath = path.join(execDir, torgsoftExportFile);
  const torgsoftProducts = readTorgsoftProducts(torgsoftExportFilePath);

  const filteredByCategoryProducts = torgsoftProducts.filter(tp => {
    return Object.values(TYPES).map(type => type.ru).some(at => tp[COLUMNS.TYPE.torgsoft].trim().includes(at));
  });
  console.log(`Всего продуктов: ${torgsoftProducts.length}, продуктов будет импортировано: ${filteredByCategoryProducts.length}`);

  const filteredByPromCheckboxProducts = torgsoftProducts.filter(tp => tp[COLUMNS.PROM_UA.torgsoft] === '+');
  console.log(`Продуктов с прометкой prom.ua: ${filteredByPromCheckboxProducts.length}`);

  if (filteredByCategoryProducts.length === 0) {
    console.log('Нет продуктов для импорта, вероятно произошла ошибка, импорт не будет выполнен\nПроверьте закрыт ли файл экспорта продуктов из Торгсофт xlsx\nПерезапустите программу после устранения ошибок.');
    await waitForKeypress(true);
    process.exit(1);
  } else if (filteredByCategoryProducts.length < 1000) {
    console.log(`Товаров для импорта: ${filteredByCategoryProducts.length}, вероятно не все товары присутствуют в файле (ожидается более 1000)\nПроверьте не применен ли фильтр в Торгсофт при экспорте\nЕсли да, то повторите экспорт без фильтрации, содайте новый файл и перезапустите программу.`);
    const userResponse = await new Promise<string>((resolve) => {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      console.log('Хотите продолжить? Нажмите Д на клавиатуре, если нет, нажмите любую другую клавишу');
      process.stdin.on('data', (data: any) => resolve(data.trim().toUpperCase()));
    });

    if (userResponse !== 'Д') {
      try {
        fs.unlinkSync(torgsoftExportFilePath);
        console.log(`Файл удален: ${torgsoftExportFilePath}`);
      } catch (error) {
        console.error('Ошибка удаления файла:', error);
      }
      console.log('Импрот отменен');
      await waitForKeypress();
      process.exit(0);
    } else {
      console.log('Продолжаем импорт, если сделали ошибку, повторите процесс с новым файлом экспорта, отмените импорт файла в кабинете Prom.ua, или дождитесь окончания процесса\nТак как все товары не не найденые в текущем файле будут скрыты в prom.ua');
    }
  }

  console.log('Логика фильтрации товаров - товары в категориях:', Object.values(TYPES).map(type => type.ru).join(', '));
  const fileNameForNonPromProducts = 'товари_без_галочки_пром.txt';
  const difference = filteredByCategoryProducts.length - filteredByPromCheckboxProducts.length;
  console.log(`Разница между количеством продуктов по выбраным категориям и количеством с пометкой prom.ua: ${difference}`);

  const productsNotInProm = filteredByCategoryProducts.filter(tp => !filteredByPromCheckboxProducts.includes((cp: any) => tp[COLUMNS.NAME.torgsoft] === cp[COLUMNS.NAME.torgsoft]));
  const filePath = path.join(uploadsDir, fileNameForNonPromProducts);
  const fileContent = productsNotInProm.map(product => product[COLUMNS.NAME.torgsoft]).join('\r\n');
  try {
    fs.writeFileSync(filePath, fileContent);
  } catch (error) {
    console.error('Ошибка записи файла:', filePath, error);
    await waitForKeypress(true);
    process.exit(1);
  }
  console.log(`Продукты, которые есть в списке по категориям, но отсутствуют в списке prom.ua, записаны в файл: ${filePath}`);

  console.log('Товары с фото: ', filteredByCategoryProducts.filter(fp => fp[COLUMNS.LINK_TO_IMAGE.torgsoft]).length, "без фото:", filteredByCategoryProducts.filter(fp => !fp[COLUMNS.LINK_TO_IMAGE.torgsoft]).length);

  const fileNameForNonPhotoProducts = 'товары_без_фото.txt';
  const productsWithoutPhoto = filteredByCategoryProducts.filter(fp => !fp[COLUMNS.LINK_TO_IMAGE.torgsoft]);
  const filePathForNonPhotoProducts = path.join(uploadsDir, fileNameForNonPhotoProducts);
  const fileContentForNonPhotoProducts = productsWithoutPhoto.map(product => product[COLUMNS.NAME.torgsoft]).join('\r\n');
  try {
    fs.writeFileSync(filePathForNonPhotoProducts, fileContentForNonPhotoProducts);
  } catch (error) {
    console.error('Ошибка записи файла:', filePathForNonPhotoProducts, error);
    await waitForKeypress(true);
    process.exit(1);
  }

  console.log(`Продукты без фото, записаны в файл: ${filePathForNonPhotoProducts}`);

  console.log('Товары с описанием: ', filteredByCategoryProducts.filter(fp => fp[COLUMNS.DESCRIPTIONS.torgsoft]).length, "без описания:", filteredByCategoryProducts.filter(fp => !fp[COLUMNS.DESCRIPTIONS.torgsoft]).length);

  const fileNameForNonDescriptionProducts = 'товары_без_описания.txt';
  const productsWithoutDescription = filteredByCategoryProducts.filter(fp => !fp[COLUMNS.DESCRIPTIONS.torgsoft]);
  const filePathForNonDescriptionProducts = path.join(uploadsDir, fileNameForNonDescriptionProducts);
  const fileContentForNonDescriptionProducts = productsWithoutDescription.map(product => product[COLUMNS.NAME.torgsoft]).join('\r\n');
  try {
    fs.writeFileSync(filePathForNonDescriptionProducts, fileContentForNonDescriptionProducts);
  }
  catch (error) {
    console.error('Ошибка записи файла:', filePathForNonDescriptionProducts, error);
    await waitForKeypress(true);
    process.exit(1);
  }

  console.log('Товары с фото и описанием: ', filteredByCategoryProducts.filter(fp => fp[COLUMNS.LINK_TO_IMAGE.torgsoft] && fp[COLUMNS.DESCRIPTIONS.torgsoft]).length);
  console.log('Товары без фото и без описания: ', filteredByCategoryProducts.filter(fp => !fp[COLUMNS.LINK_TO_IMAGE.torgsoft] && !fp[COLUMNS.DESCRIPTIONS.torgsoft]).length);
  console.log('Товары без фото но с описанием: ', filteredByCategoryProducts.filter(fp => !fp[COLUMNS.LINK_TO_IMAGE.torgsoft] && fp[COLUMNS.DESCRIPTIONS.torgsoft]).length);

  const importPromFile = path.join(uploadsDir, `import_to_prom_${formatDate()}.xlsx`);
  await importToProm(filteredByCategoryProducts, importPromFile);
  // try {
  //   const { token } = await login(process.env.BOLAGRO_USER!, process.env.BOLAGRO_PASSWORD!);
  //   // await createCategories(Object.values(TYPES), token)
  //   const { sales_channels } = await getSalesChannels(token);
  //   const { product_categories } = await getCategories(token);
  //   const bolagroProducts = filteredProducts.map(tp => {
  //     return mapToBolagroImportProduct(tp, sales_channels[0].id, product_categories.find((cat: any) => cat.name === Object.values(TYPES).find(type => tp[COLUMNS.TYPE.torgsoft].includes(type.torgsoft))?.ru)!);
  //   });
  //   const products: any[] = await getAllProducts(token, 'external_id')
  //   console.log(products[0])
  //   const importBolagroFile = path.join(uploadsDir, `import_to_bolagro_${formatDate()}.csv`);

  //   await writeToBolagroCsvImportFile(importBolagroFile, bolagroProducts);
  //   await uploadProductsFile(importBolagroFile, token);
  // } catch (error) {
  //   console.error('Ошибка обновления товаров в магазине Болагро', error);
  //   await waitForKeypress();
  //   process.exit(1);
  // }

  // Delete the XLSX file at the end of the program
  try {
    fs.unlinkSync(torgsoftExportFilePath);
    console.log(`Файл удален: ${torgsoftExportFilePath}`);
  } catch (error) {
    console.error('Ошибка удаления файла:', error);
    await waitForKeypress();
    process.exit(1);
  }
  console.log('Программа завершена, нажмите любую клавишу для выхода');
  await waitForKeypress();
}

main();