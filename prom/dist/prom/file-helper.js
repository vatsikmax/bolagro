"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPromProducts = readPromProducts;
exports.writeToImportFile = writeToImportFile;
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function readPromProducts(promExportFilePath) {
    // Load the workbook
    const workbook = xlsx_1.default.readFile(promExportFilePath);
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Convert sheet to JSON
    const jsonData = xlsx_1.default.utils.sheet_to_json(sheet, { header: 1 });
    // Extract the column names from the first row
    const columnNames = jsonData[0];
    // Convert each row into an object
    const products = jsonData.slice(1).map(row => {
        const product = {};
        columnNames.forEach((col, index) => {
            product[col] = row[index];
        });
        return product;
    });
    return products;
}
async function writeToImportFile(promImportFilePath, products, groups) {
    console.log('Починаю запис в файл', promImportFilePath);
    // Ensure the directory exists
    const dir = path_1.default.dirname(promImportFilePath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    const exportProductsSheet = xlsx_1.default.utils.json_to_sheet(products);
    const exportGroupsSheet = xlsx_1.default.utils.json_to_sheet(groups);
    const workbook = xlsx_1.default.utils.book_new();
    xlsx_1.default.utils.book_append_sheet(workbook, exportProductsSheet, 'Export Products Sheet');
    xlsx_1.default.utils.book_append_sheet(workbook, exportGroupsSheet, 'Export Groups Sheet');
    xlsx_1.default.writeFile(workbook, promImportFilePath);
    console.log('Запис завершено');
}
