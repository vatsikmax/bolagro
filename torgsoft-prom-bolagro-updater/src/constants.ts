import readline from 'readline';

export const TYPES = Object.freeze({
  SEEDS: { ru: "Семена, саженцы и рассада", ua: "Насіння, саджанці та розсада", prom: "https://prom.ua/ua/Ovoschnye-kultury", id: 12102, handle: "seeds" },
  FERTILIZERS: { ru: "Удобрения", ua: "Добрива, загальне", prom: "https://prom.ua/ua/Udobreniya-obschee", id: 11699, handle: "fertilizers" },
  PLAN_PROTECTION_PRODUCS: { ru: "Средства защиты растений", ua: "Засоби захисту рослин, загальне", prom: "https://prom.ua/ua/Sredstva-zaschity-rastenij-obschee", id: 11106, handle: "protection" },
  DRIP_IRRIGATION: { ru: "Набор для капельного орошения", ua: "Набори для крапельного поливу", prom: "https://prom.ua/ua/Nabory-dlya-kapelnogo", id: 1250359, handle: "irrigation" },
  BEE_KEEPING: { ru: "Пчеловодство", ua: "Бджільництво", prom: "https://prom.ua/ua/Pchelovodstvo", id: 105, handle: "beekeeping" },
  SOILS: { ru: "Субстраты, компосты для растений", ua: "Субстрати, компости для рослин", prom: "https://prom.ua/ua/Substraty-komposty-dlya-rastenij", id: 12520, handle: "soils" },
  NITROGEN_FERTILIZERS: { ru: "Азотные удобрения", ua: "Азотні добрива", prom: "https://prom.ua/ua/Azotnye-udobreniya", id: 11504, handle: "nitrogen-fertilizers" },
  BACTERIAL_FERTILIZERS: { ru: "Бактериальные удобрения", ua: "Бактеріальні добрива", prom: "https://prom.ua/ua/Bakterialnye-udobreniya", id: 11605, handle: "bacterial-fertilizers" },
  VERMICULITE_FERTILIZERS: { ru: "Вермикулитовые удобрения", ua: "Вермикулітові добрива", prom: "https://prom.ua/ua/Vermikulitovye-udobreniya", id: 11508, handle: "vermiculite-fertilizers" },
  CALCIUM_FERTILIZERS: { ru: "Кальциевые удобрения", ua: "Кальцієві добрива", prom: "https://prom.ua/ua/Kaltsievye-udobreniya", id: 11608, handle: "calcium-fertilizers" },
  POTASH_FERTILIZERS: { ru: "Калийные удобрения", ua: "Калійні добрива", prom: "https://prom.ua/ua/Kalievye-udobreniya", id: 11506, handle: "potash-fertilizers" },
  COMPLEX_FERTILIZERS: { ru: "Комплексные удобрения", ua: "Комплексні добрива", prom: "https://prom.ua/ua/Kompleksnye-udobreniya", id: 11503, handle: "complex-fertilizers" },
  MICTROFERTILIZERS: { ru: "Микроудобрения", ua: "Мікродобрива", prom: "https://prom.ua/ua/Mikroudobreniya", id: 11607, handle: "microfertilizers" },
  ORGANIC_FERTILIZERS: { ru: "Органические удобрения", ua: "Органічні добрива", prom: "https://prom.ua/ua/Organicheskie-udobreniya", id: 11502, handle: "organic-fertilizers" },
  PLANT_GROWTH_REGULATORS: { ru: "Регуляторы роста растений", ua: "Регулятори росту рослин", prom: "https://prom.ua/ua/Regulyatory-rosta-rastenij", id: 11604, handle: "plant-growth-regulators" },
  PHOSPHORUS_FERTILIZERS: { ru: "Фосфорные удобрения", ua: "Фосфорні добрива", prom: "https://prom.ua/ua/Fosfornye-udobreniya", id: 11505, handle: "phosphorus-fertilizers" },
  INSECTICIDES: { ru: "Инсектициды", ua: "Інсектициди", prom: "https://prom.ua/ua/Insektitsidy", id: 11603, handle: "insecticides" },
  BACTERICIDES: { ru: "Бактерициды", ua: "Бактерициди", prom: "https://prom.ua/ua/Bakteritsidy", id: 1160206, handle: "bactericides" },
  BIOLOGICAL_PRODUCTS: { ru: "Биопрепараты", ua: "Біопрепарати", prom: "https://prom.ua/ua/Biopreparaty", id: 1110501, handle: "biological-products" },
  HERBICIDES: { ru: "Гербициды", ua: "Гербіциди", prom: "https://prom.ua/ua/Gerbitsidy-1", id: 1160205, handle: "herbicides" },
  DESUCCANTS: { ru: "Десиканты", ua: "Десиканти", prom: "https://prom.ua/ua/Desikanty", id: 11108, handle: "desiccants" },
  ZOOCIDES: { ru: "Зооциды", ua: "Зооциди", prom: "https://prom.ua/ua/Zootsidy", id: 1160208, handle: "zoocides" },
  ADHESIVES: { ru: "Прилипатели", ua: "Прилипачі", prom: "https://prom.ua/ua/Prilipateli", id: 11107, handle: "adhesives" },
  SEED_TREATMENT_AGENTS: { ru: "Протравители семян", ua: "Протруйники насіння", prom: "https://prom.ua/ua/Protraviteli-semyan", id: 1160207, handle: "seed-treatment-agents" },
  FUNGICIDES: { ru: "Фунгициды", ua: "Фунгіциди", prom: "https://prom.ua/ua/Fungitsidy", id: 11601, handle: "fungicides" },
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