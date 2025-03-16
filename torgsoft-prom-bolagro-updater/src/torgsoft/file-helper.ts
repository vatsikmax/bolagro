import xlsx from 'xlsx';

interface Product {
  [key: string]: any;
}

export function readTorgsoftProducts(torgsoftExportFilePath: string): Product[] {
  // Load the workbook
  const workbook = xlsx.readFile(torgsoftExportFilePath);

  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON
  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  // Extract the table data
  const tableData = jsonData.slice(2, jsonData.length - 2);

  // Get the column names from the first row of the table
  const columnNames = tableData[0];

  // Convert each row into an object
  const products = tableData.slice(1).map(row => {
    const product: Product = {};
    columnNames.forEach((col, index) => {
      product[col] = row[index];
    });
    return product;
  });

  return products;
}