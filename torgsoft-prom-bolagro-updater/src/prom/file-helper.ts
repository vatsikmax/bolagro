import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

interface Product {
  [key: string]: any;
}

interface Group {
  [key: string]: any;
}

export function readPromProducts(promExportFilePath: string): Product[] {
  // Load the workbook
  const workbook = xlsx.readFile(promExportFilePath);

  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON
  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  // Extract the column names from the first row
  const columnNames = jsonData[0];

  // Convert each row into an object
  const products = jsonData.slice(1).map(row => {
    const product: Product = {};
    columnNames.forEach((col, index) => {
      product[col] = row[index];
    });
    return product;
  });

  return products;
}

export async function writeToPromXlsxImportFile(promImportFilePath: string, products: Product[], groups: Group[]): Promise<void> {
  console.log('Начинаю запись в файл для импорта в Prom', promImportFilePath);

  // Ensure the directory exists
  const dir = path.dirname(promImportFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const exportProductsSheet = xlsx.utils.json_to_sheet(products);
  const exportGroupsSheet = xlsx.utils.json_to_sheet(groups);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, exportProductsSheet, 'Export Products Sheet');
  xlsx.utils.book_append_sheet(workbook, exportGroupsSheet, 'Export Groups Sheet');
  xlsx.writeFile(workbook, promImportFilePath);
  console.log('Запись окончена');
}