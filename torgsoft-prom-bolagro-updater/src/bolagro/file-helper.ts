import { parse } from 'json2csv';
import fs from 'fs';

export async function writeToBolagroCsvImportFile(bolagroImportFilePath: string, products: any): Promise<void> {
  console.log('Начинаю запись в файл для импорта в Болагро', bolagroImportFilePath);
  try {
    const csv = parse(products);
    fs.writeFileSync(bolagroImportFilePath, csv);
    console.log(`Запись окончена: ${bolagroImportFilePath}`);
  } catch (error) {
    console.error('Ошибка создания CSV файла для импорта в болагро:', error);
    throw error;
  }
}
