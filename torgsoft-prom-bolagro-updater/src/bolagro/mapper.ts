import { COLUMNS } from "../constants";

function cyrillicToHandle(title: string) {
  const cyrillicMap: any = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ъ': '', 'ь': '', 'є': 'ye',
    'і': 'i', 'ї': 'yi', 'ґ': 'g'
  };

  let transliterated = title.toLowerCase().split('').map(char =>
    cyrillicMap[char] !== undefined ? cyrillicMap[char] : char
  ).join('');

  // Replace spaces with dashes, remove non-alphanumeric characters except dashes
  return transliterated.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function mapToBolagroCategory(name: string) {
  return {
    name: name,
    is_active: true,
    handle: cyrillicToHandle(name),
    is_internal: false,
  }
}

export function mapToLocationLevel(inventoryItemId: string, locationId: string, quantity: number) {
  return {
    inventory_item_id: inventoryItemId,
    location_id: locationId,
    stocked_quantity: quantity,
  }
}

export function mapToUpdateBolagroProduct(existingBolagroProduct: any, torgsoftProduct: any) {
  return {
    ...existingBolagroProduct,
    title: torgsoftProduct[COLUMNS.NAME.torgsoft],
    description: torgsoftProduct[COLUMNS.DESCRIPTIONS.torgsoft] ? torgsoftProduct[COLUMNS.DESCRIPTIONS.torgsoft]
      .replace(/_x000d_/g, '')  // Remove _x000d_
      .replace(/\r/g, '')       // Remove any leftover carriage returns
      .replace(/\n{2,}/g, '\n') // Remove excessive new lines (if any)
      .trim() : undefined,
    handle: cyrillicToHandle(torgsoftProduct[COLUMNS.NAME.torgsoft]),
    images: torgsoftProduct[COLUMNS.LINK_TO_IMAGE.torgsoft] ? [
      {
        url: torgsoftProduct[COLUMNS.LINK_TO_IMAGE.torgsoft]
          .replace(/_x000d_/g, '')  // Remove _x000d_
          .replace(/\r/g, '')       // Remove any leftover carriage returns
          .replace(/\n{2,}/g, '\n') // Remove excessive new lines (if any)
          .trim()
      },
    ] : undefined,
  }
}

export function mapToBolagroProduct(torgsoftProduct: any, salesChannelId: string, shippingProfileId: string) {
  return {
    title: torgsoftProduct[COLUMNS.NAME.torgsoft],
    // category_ids: [categoryId],
    description: torgsoftProduct[COLUMNS.DESCRIPTIONS.torgsoft] ? torgsoftProduct[COLUMNS.DESCRIPTIONS.torgsoft]
      .replace(/_x000d_/g, '')  // Remove _x000d_
      .replace(/\r/g, '')       // Remove any leftover carriage returns
      .replace(/\n{2,}/g, '\n') // Remove excessive new lines (if any)
      .trim() : undefined,
    handle: cyrillicToHandle(torgsoftProduct[COLUMNS.NAME.torgsoft]),
    status: 'published',
    shipping_profile_id: shippingProfileId,
    external_id: torgsoftProduct[COLUMNS.EXTERNAL_ID.torgsoft].toString(),
    images: torgsoftProduct[COLUMNS.LINK_TO_IMAGE.torgsoft] ? [
      {
        url: torgsoftProduct[COLUMNS.LINK_TO_IMAGE.torgsoft]
          .replace(/_x000d_/g, '')  // Remove _x000d_
          .replace(/\r/g, '')       // Remove any leftover carriage returns
          .replace(/\n{2,}/g, '\n') // Remove excessive new lines (if any)
          .trim()
      },
    ] : undefined,
    options: [
      {
        title: "Measurement",
        values: ["шт."],
      },
    ],
    variants: [
      {
        manage_inventory: true,
        title: "Пакет",
        options: {
          Measurement: "шт.",
        },
        prices: [
          {
            amount: typeof torgsoftProduct[COLUMNS.PRICE.torgsoft] === 'number' ? torgsoftProduct[COLUMNS.PRICE.torgsoft] : Number(torgsoftProduct[COLUMNS.PRICE.torgsoft].replace(',', '.')),
            currency_code: "uah",
          },
        ],
      },
    ],
    sales_channels: [
      {
        id: salesChannelId,
      },
    ],
  }
}

export function mapToBolagroImportProductCsv(torgsoftProduct: any, salesChannelId: string, category: any) {
  try {
    return {
      "Product Id": undefined,
      "Product Handle": cyrillicToHandle(torgsoftProduct[COLUMNS.NAME.torgsoft]),
      "Product Title": torgsoftProduct[COLUMNS.NAME.torgsoft],
      "Product Subtitle": undefined,
      "Product Description": torgsoftProduct[COLUMNS.DESCRIPTIONS.torgsoft] ? torgsoftProduct[COLUMNS.DESCRIPTIONS.torgsoft]
        .replace(/_x000d_/g, '')  // Remove _x000d_
        .replace(/\r/g, '')       // Remove any leftover carriage returns
        .replace(/\n{2,}/g, '\n') // Remove excessive new lines (if any)
        .trim() : undefined,
      "Product Status": "published",
      "Product Thumbnail": torgsoftProduct[COLUMNS.LINK_TO_IMAGE.torgsoft] ? torgsoftProduct[COLUMNS.LINK_TO_IMAGE.torgsoft]
        .replace(/_x000d_/g, '')  // Remove _x000d_
        .replace(/\r/g, '')       // Remove any leftover carriage returns
        .replace(/\n{2,}/g, '\n') // Remove excessive new lines (if any)
        .trim() : undefined,
      "Product Weight": undefined,
      "Product Length": undefined,
      "Product Width": undefined,
      "Product Height": undefined,
      "Product HS Code": undefined,
      "Product Origin Country": torgsoftProduct[COLUMNS.COUNTRY.torgsoft] !== 'НЕТ ИНФОРМАЦИИ' ? torgsoftProduct[COLUMNS.COUNTRY.torgsoft] : '',
      "Product MID Code": undefined,
      "Product Material": undefined,
      "Product Collection Title": undefined,
      "Product Collection Handle": undefined,
      "Product Type": undefined,
      "Product Tags": undefined,
      "Product Discountable": "FALSE",
      "Product External Id": torgsoftProduct[COLUMNS.EXTERNAL_ID.torgsoft],
      "Product Profile Name": undefined,
      "Product Profile Type": undefined,
      "Variant Id": undefined,
      "Variant Title": 'шт.',
      "Variant SKU": undefined,
      "Variant Barcode": undefined,
      "Variant Inventory Quantity": (typeof torgsoftProduct[COLUMNS.QUANTITY.torgsoft] === 'number' ? Math.floor(torgsoftProduct[COLUMNS.QUANTITY.torgsoft]) : Math.floor(Number(torgsoftProduct[COLUMNS.QUANTITY.torgsoft].replace(', ', '.')))),
      "Variant Allow Backorder": "FALSE",
      "Variant Manage Inventory": "TRUE",
      "Variant Weight": undefined,
      "Variant Length": undefined,
      "Variant Width": undefined,
      "Variant Height": undefined,
      "Variant HS Code": undefined,
      "Variant Origin Country": "Ukraine",
      "Variant MID Code": undefined,
      "Variant Material": undefined,
      "Price UAH": typeof torgsoftProduct[COLUMNS.PRICE.torgsoft] === 'number' ? torgsoftProduct[COLUMNS.PRICE.torgsoft] : Number(torgsoftProduct[COLUMNS.PRICE.torgsoft].replace(',', '.')),
      "Option 1 Name": "Вид упаковки",
      "Option 1 Value": "шт.",
      "Product Sales Channel 1": salesChannelId,
      "Image 1 Url": undefined,
      "Image 2 Url": undefined,
    }
  } catch (error: any) {
    console.error('Ошибка маппинга товара:', error.message);
    throw error;
  }
}
