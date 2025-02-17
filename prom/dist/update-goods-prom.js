#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const read_export_file_1 = require("./torgsoft/read-export-file");
const file_helper_1 = require("./prom/file-helper");
const api_1 = require("./prom/api");
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const fs_1 = __importDefault(require("fs"));
// Get the directory of the executable
const execDir = process.pkg ? path_1.default.dirname(process.execPath) : __dirname;
// Create a writable stream for the log file
const logFile = fs_1.default.createWriteStream(path_1.default.join(execDir, 'logs'), { flags: 'a' });
// Override console.log to write to both the console and the log file
const originalConsoleLog = console.log;
console.log = function (message, ...optionalParams) {
    originalConsoleLog(message, ...optionalParams);
    logFile.write(`${message} ${optionalParams.join(' ')}\n`);
};
function formatDate() {
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yy}_${hh}-${min}`;
}
function waitForKeypress() {
    return new Promise((resolve) => {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        console.log("Нажміть будь-яку кнопку для продовження...");
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on("data", () => {
            process.stdin.setRawMode(false);
            rl.close();
            resolve();
        });
    });
}
const TYPES = Object.freeze({
    SEEDS: { torgsoft: "Семена", ru: "Семена, саженцы и рассада", ua: "Насіння, саджанці та розсада", prom: "https://prom.ua/ua/Ovoschnye-kultury", id: 12102 },
    FERTILIZERS: { torgsoft: "Удобрения", ru: "Удобрения", ua: "Добрива, загальне", prom: "https://prom.ua/ua/Udobreniya-obschee", id: 11699 },
    PLAN_PROTECTION_PRODUCS: { torgsoft: "СЗР", ru: "Средства защит растений", ua: "Засоби захисту рослин, загальне", prom: "https://prom.ua/ua/Sredstva-zaschity-rastenij-obschee", id: 11106 },
    DRIP_IRRIGATION: { torgsoft: "Капельное орошение", ru: "Набор для капельного орошения", ua: "Набори для крапельного поливу", prom: "https://prom.ua/ua/Nabory-dlya-kapelnogo", id: 1250359 },
    BEE_KEEPING: { torgsoft: "Пчеловодство", ru: "Пчеловодство", ua: "Бджільництво", prom: "https://prom.ua/ua/Pchelovodstvo", id: 105 },
    SOILS: { torgsoft: "Грунты", ru: "Субстраты, компосты для растений", ua: "Субстрати, компости для рослин", prom: "https://prom.ua/ua/Substraty-komposty-dlya-rastenij", id: 12520 },
});
const COLUMNS = Object.freeze({
    NAME: { torgsoft: "Название товара", prom: "Назва_позиції" },
    NAME_UKR: { prom: "Назва_позиції_укр" },
    DESCRIPTIONS: { torgsoft: "Описание", prom: "Опис" },
    DESCRIPTIONS_UKR: { prom: "Опис_укр" },
    PRICE: { torgsoft: "Цена розничная", prom: "Ціна" },
    QUANTITY: { torgsoft: "Количество", prom: "Кількість" },
    LINK_TO_IMAGE: { torgsoft: "Ссылка на фото", prom: "Посилання_зображення" },
    UNIT_OF_MEASUREMENT: { torgsoft: "Ед. изм.", prom: "Одиниця_виміру" },
    EXTERNAL_ID: { torgsoft: "Код фото", prom: "Ідентифікатор_товару" },
    UNITQUE_ID: { prom: "Унікальний_ідентифікатор" },
    MANUFACTURER: { torgsoft: "Производитель", prom: "Виробник" },
    COUNTRY: { torgsoft: "Страна производитель", prom: "Країна_виробник" },
    CURRENCY: { prom: "Валюта" },
    TYPE: { prom: "Посилання_підрозділу", torgsoft: "Вид товара" },
    GROUP_NAME: { prom: "Назва_групи" },
    CELL_TYPE: { prom: "Тип_товару" },
    AVAILABILITY: { prom: "Наявність" },
    GROUP_NUMBER: { prom: "Номер_групи" }
});
function getGroups() {
    return Object.values(TYPES).map(type => {
        return {
            "Назва_групи": type.ru,
            "Назва_групи_укр": TYPES.SEEDS.ua,
            [COLUMNS.GROUP_NUMBER.prom]: type.id,
        };
    });
}
function mapToPromImportProduct(torgsoftProduct) {
    const quantity = (typeof torgsoftProduct[COLUMNS.QUANTITY.torgsoft] === 'number' ? Math.floor(torgsoftProduct[COLUMNS.QUANTITY.torgsoft]) : Math.floor(Number(torgsoftProduct[COLUMNS.QUANTITY.torgsoft].replace(', ', '.'))));
    const price = typeof torgsoftProduct[COLUMNS.PRICE.torgsoft] === 'number' ? torgsoftProduct[COLUMNS.PRICE.torgsoft] : Number(torgsoftProduct[COLUMNS.PRICE.torgsoft].replace(',', '.'));
    const unitOfMeasurement = torgsoftProduct[COLUMNS.UNIT_OF_MEASUREMENT.torgsoft].trim() === '' ? 'шт.' : torgsoftProduct[COLUMNS.UNIT_OF_MEASUREMENT.torgsoft].trim();
    const linkToImage = torgsoftProduct[COLUMNS.LINK_TO_IMAGE.torgsoft] ? torgsoftProduct[COLUMNS.LINK_TO_IMAGE.torgsoft]
        .replace(/_x000d_/g, '') // Remove _x000d_
        .replace(/\r/g, '') // Remove any leftover carriage returns
        .replace(/\n{2,}/g, '\n') // Remove excessive new lines (if any)
        .trim() : undefined;
    const description = torgsoftProduct[COLUMNS.DESCRIPTIONS.torgsoft] ? torgsoftProduct[COLUMNS.DESCRIPTIONS.torgsoft]
        .replace(/_x000d_/g, '') // Remove _x000d_
        .replace(/\r/g, '') // Remove any leftover carriage returns
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
async function main() {
    // Find the first XLSX file in the directory
    const files = fs_1.default.readdirSync(execDir);
    const xlsxFile = files.find(file => file.endsWith('.xlsx'));
    if (!xlsxFile) {
        console.error(`Не знайдено жодного XLSX файлу в ${execDir}.`);
        await waitForKeypress();
        process.exit(1);
    }
    const torgsoftExportFilePath = path_1.default.join(execDir, xlsxFile);
    const torgsoftProducts = (0, read_export_file_1.readTorgsoftProducts)(torgsoftExportFilePath);
    const filteredProducts = torgsoftProducts.filter(tp => {
        return Object.values(TYPES).map(type => type.torgsoft).some(at => tp[COLUMNS.TYPE.torgsoft].trim().includes(at));
    });
    console.log(`Всього продуктів: ${torgsoftProducts.length}, продуктів буде імпортовано: ${filteredProducts.length}`);
    const promImportProducts = filteredProducts.map(tp => {
        return mapToPromImportProduct(tp);
    });
    // Create 'uploads' folder if it doesn't exist
    const uploadsDir = path_1.default.join(execDir, 'uploads');
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    const importPromFile = path_1.default.join(uploadsDir, `import_to_prom_${formatDate()}.xlsx`);
    try {
        await (0, file_helper_1.writeToImportFile)(importPromFile, promImportProducts, getGroups());
    }
    catch (error) {
        console.error('Помилка запису в файл:', error);
        await waitForKeypress();
        process.exit(1);
    }
    try {
        await (0, api_1.importToPromByFile)(importPromFile);
    }
    catch (error) {
        console.error('Помилка імпорту в пром:', error);
        await waitForKeypress();
        process.exit(1);
    }
    // Delete the XLSX file at the end of the program
    try {
        fs_1.default.unlinkSync(torgsoftExportFilePath);
        console.log(`Файл видалено: ${torgsoftExportFilePath}`);
    }
    catch (error) {
        console.error('Помилка видалення файлу:', error);
        await waitForKeypress();
        process.exit(1);
    }
    await waitForKeypress();
}
main();
