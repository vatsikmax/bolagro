import readline from 'readline';

export const TYPES = Object.freeze({
  SEEDS: { ru: "Семена, саженцы и рассада", ua: "Насіння, саджанці та розсада", prom: "https://prom.ua/ua/Ovoschnye-kultury", id: 12102, handle: "seeds" },
  FERTILIZERS: { ru: "Удобрения", ua: "Добрива, загальне", prom: "https://prom.ua/ua/Udobreniya-obschee", id: 11699, handle: "fertilizers" },
  PLAN_PROTECTION_PRODUCS: { ru: "Средства защиты растений", ua: "Засоби захисту рослин, загальне", prom: "https://prom.ua/ua/Sredstva-zaschity-rastenij-obschee", id: 11106, handle: "protection" },
  DRIP_IRRIGATION: { ru: "Набор для капельного орошения", ua: "Набори для крапельного поливу", prom: "https://prom.ua/ua/Nabory-dlya-kapelnogo", id: 1250359, handle: "irrigation" },
  BEE_KEEPING: { ru: "Пчеловодство", ua: "Бджільництво", prom: "https://prom.ua/ua/Pchelovodstvo", id: 105, handle: "beekeeping" },
  SOILS: { ru: "Субстраты, компосты для растений", ua: "Субстрати, компости для рослин", prom: "https://prom.ua/ua/Substraty-komposty-dlya-rastenij", id: 12520, handle: "soils" },
});

export const COLUMNS = Object.freeze({
  NAME: { torgsoft: "Название товара", prom: "Назва_позиції" },
  NAME_UKR: { prom: "Назва_позиції_укр" },
  DESCRIPTIONS: { torgsoft: "Описание", prom: "Опис" },
  DESCRIPTIONS_UKR: { prom: "Опис_укр" },
  PRICE: { torgsoft: "Цена розничная", prom: "Ціна" },
  QUANTITY: { torgsoft: "Количество", prom: "Кількість" },
  LINK_TO_IMAGE: { torgsoft: "Ссылка на фото", prom: "Посилання_зображення" },
  UNIT_OF_MEASUREMENT: { torgsoft: "Ед. изм.", prom: "Одиниця_виміру" },
  PROM_UA: { torgsoft: "prom.ua" },
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

export function formatDate(): string {
  const date = new Date();
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
  const yy = String(date.getFullYear()).slice(-2);
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}-${mm}-${yy}_${hh}-${min}`;
}

export function waitForKeypress(hasError: boolean = false): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const staticMsg = 'Нажмите любую кнопку для завершения...'
    console.log(hasError ? `Программа остановленна из-за ошибки.` : `Программа окончена успешно.`, staticMsg);

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", () => {
      process.stdin.setRawMode(false);
      rl.close();
      resolve();
    });
  });
}