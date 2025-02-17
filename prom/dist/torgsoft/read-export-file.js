"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTorgsoftProducts = readTorgsoftProducts;
const xlsx_1 = __importDefault(require("xlsx"));
function readTorgsoftProducts(torgsoftExportFilePath) {
    // Load the workbook
    const workbook = xlsx_1.default.readFile(torgsoftExportFilePath);
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Convert sheet to JSON
    const jsonData = xlsx_1.default.utils.sheet_to_json(sheet, { header: 1 });
    // Extract the table data
    const tableData = jsonData.slice(2, jsonData.length - 2);
    // Get the column names from the first row of the table
    const columnNames = tableData[0];
    // Convert each row into an object
    const products = tableData.slice(1).map(row => {
        const product = {};
        columnNames.forEach((col, index) => {
            product[col] = row[index];
        });
        return product;
    });
    return products;
}
