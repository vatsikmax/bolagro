import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["ua"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: "uah",
            is_default: true,
          },
          {
            currency_code: 'mdl'
          },
          {
            currency_code: "eur",
          },
          {
            currency_code: "usd",
          },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Ukraine",
          currency_code: "uah",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  // logger.info("Seeding tax regions...");
  // await createTaxRegionsWorkflow(container).run({
  //   input: countries.map((country_code) => ({
  //     country_code,
  //   })),
  // });
  // logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Ukraine Warehouse",
          address: {
            city: "Bolhrad",
            country_code: "UA",
            address_1: "улица Блогарских ополченцев, Vulytsya Asena Khrysteva, 31, Bolhrad, Ukraine, 68700",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const { result: shippingProfileResult } =
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default",
            type: "default",
          },
        ],
      },
    });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Ukraine",
        geo_zones: [
          {
            country_code: "ua",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  // await createShippingOptionsWorkflow(container).run({
  //   input: [
  //     {
  //       name: "Standard Shipping",
  //       price_type: "flat",
  //       provider_id: "manual_manual",
  //       service_zone_id: fulfillmentSet.service_zones[0].id,
  //       shipping_profile_id: shippingProfile.id,
  //       type: {
  //         label: "Standard",
  //         description: "Ship in 2-3 days.",
  //         code: "standard",
  //       },
  //       prices: [
  //         {
  //           currency_code: "usd",
  //           amount: 10,
  //         },
  //         {
  //           currency_code: "eur",
  //           amount: 10,
  //         },
  //         {
  //           region_id: region.id,
  //           amount: 10,
  //         },
  //       ],
  //       rules: [
  //         {
  //           attribute: "enabled_in_store",
  //           value: "true",
  //           operator: "eq",
  //         },
  //         {
  //           attribute: "is_return",
  //           value: "false",
  //           operator: "eq",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Express Shipping",
  //       price_type: "flat",
  //       provider_id: "manual_manual",
  //       service_zone_id: fulfillmentSet.service_zones[0].id,
  //       shipping_profile_id: shippingProfile.id,
  //       type: {
  //         label: "Express",
  //         description: "Ship in 24 hours.",
  //         code: "express",
  //       },
  //       prices: [
  //         {
  //           currency_code: "usd",
  //           amount: 10,
  //         },
  //         {
  //           currency_code: "eur",
  //           amount: 10,
  //         },
  //         {
  //           region_id: region.id,
  //           amount: 10,
  //         },
  //       ],
  //       rules: [
  //         {
  //           attribute: "enabled_in_store",
  //           value: "true",
  //           operator: "eq",
  //         },
  //         {
  //           attribute: "is_return",
  //           value: "false",
  //           operator: "eq",
  //         },
  //       ],
  //     },
  //   ],
  // });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Bolagro",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Семена, саженцы и рассада",
          is_active: true,
        },
        {
          name: "Удобрения",
          is_active: true,
        },
        {
          name: "Средства защиты растений",
          is_active: true,
        },
        {
          name: "Набор для капельного орошения",
          is_active: true,
        },
        {
          name: "Пчеловодство",
          is_active: true,
        },
        {
          name: "Субстраты, компосты для растений",
          is_active: true,
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Гарбуз Волзький сірий",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Семена, саженцы и рассада")!.id,
          ],
          description:
            "Характеристики та опис\nНасіння Гарбуз Волзький сірий\nВага упаковка – 10 г\nСорт – середньопізній (120-125 днів)\nВиробник - Садиба центр\nГарбуз Волзький сірий - середньопізній (120-125 днів) великоплідний високоврожайний сорт універсального призначення. Рослина довгоплетиста, потужна, довжина стебла до 8 м. Плоди сплюснуті з гладкою поверхнею і легкою сегментацією, зеленувато-сірого кольору без малюнка. Вага плодів 6-9 кг. М'якуш жовто-кремовий, середньої щільності й цукристості. Врожайність 18-35 кг/м",
          handle: "garbuz-volzkiy-siriy",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://images.prom.ua/4827989119_w640_h640_tykva-volzhskaya-seraya.jpg",
            },
          ],
          options: [
            {
              title: "Measurement",
              values: ["шт."],
            },
          ],
          variants: [
            {
              title: "Пакет",
              options: {
                Measurement: "шт.",
              },
              prices: [
                {
                  amount: 20,
                  currency_code: "uah",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Grandis®",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Удобрения")!.id,
          ],
          description:
            "Характеристики та опис\nОсновні\nВиробник\nКіссон\nКраїна виробник\nУкраїна\nПрепаративна форма\nПорошок\nУпаковка\nВага\n0.01 кг\nКористувальницькі характеристики\nБренд\nKisson\nКатегорія товарів: регулятори росту\nДіюча речовина: індоліл-3-масляна кислота, амінокислоти, вітаміни\nВиробник: ТД Кішонський",
          handle: "grandis",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://images.prom.ua/2832977764_w640_h640_grandis-10g-grandis.jpg",
            },
          ],
          options: [
            {
              title: "Measurement",
              values: ["г."],
            },
          ],
          variants: [
            {
              title: "10",
              options: {
                Measurement: "г.",
              },
              prices: [
                {
                  amount: 10,
                  currency_code: "uah",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Акробат 1 кг",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Средства защиты растений")!.id,
          ],
          description:
            "Акробат МЦ - фунгицид системно-контактного действия. Эффективная защита овощных культур и винограда от распространенных грибковых заболеваний (фитофтороз, перено-нароз, альтернариоз, миндью). Высокая эффективность против патогенов, чувствительных к фениламидам.\nДействующее вещество: Диметоморф 90 г/кг.\nМанкоцеб 600 г/кг.\nСочетание двух компонентов способствует предотвращению резистентности у патогенных организмов.\nЛокально - системное и контактное действие на возбудителей болезни, обеспечивает надежную защиту растени.",
          handle: "akrobat-1-kg",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://images.prom.ua/4810234042_w640_h640_akrobat-1kg-basf.jpg",
            },
          ],
          options: [
            {
              title: "Measurement",
              values: ["кг."],
            },
          ],
          variants: [
            {
              title: "Measurement ",
              options: {
                Measurement: "кг.",
              },
              prices: [
                {
                  amount: 1050,
                  currency_code: "uah",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Аквакорм",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Пчеловодство")!.id,
          ],
          description:
            "Использовать препарат стоит в весенний и летнее-осенний период , в качестве жидкого сиропа для пчел. Препарат готов к расфасовке по кормушкам, после смешивания 20 г порошка на 10 л воды. Открывать упаковку рекомендуется непосредственно перед применением препарата . Мед,  собранный с пчел, подвергавшихся воздействию “Аквакорм”-а используют в пищу на общих основаниях.",
          handle: "akvakorm",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://images.prom.ua/3467816597_w640_h640_akvakorm-podkormka-20g.jpg",
            },
          ],
          options: [
            {
              title: "Measurement",
              values: ["шт."],
            },
          ],
          variants: [
            {
              title: "шт.",
              options: {
                Measurement: "шт.",
              },
              prices: [
                {
                  amount: 25,
                  currency_code: "uah",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Грунтосуміш для Хвойних 40л ТД Кисон",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Субстраты, компосты для растений")!.id,
          ],
          description: "Характеристики та опис\nКатегорія товарів: субстрати Діюча речовина: перехідний торф, низинний торф, підкислювач природного походження, натуральні ґрунтопокращуючі речовини, річковий пісок, добрива Виробник: ТД Киссон Властивості: забезпечує оптимальний рівень кислотності субстрату (pH) для хвойних рослин; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість насіння, приживлюваність розсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість насіння, приживлюваність розсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість насіння, приживлюваність розсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість насіння, приживлюваність розсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість насіння, приживлюваність\nрозсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість насіння, приживлюваність розсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість насіння, приживлюваність розсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість насіння, приживлюваність розсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість на\nсіння, приживлюваність розсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість насіння, приживлюваність розсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість насіння, приживлюваність розсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі; покращує схожість насіння, приживлюваність розсади та вкорінення саджанців; забезпечує рослини необхідними елементами живлення; підвищений вміст магнію враховує індивідуальні потреби хвойних рослин в даному елементі",
          handle: "gruntosumish-dlya-hvoyinih-40l-td-kison",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://images.prom.ua/3467816597_w640_h640_akvakorm-podkormka-20g.jpg",
            },
          ],
          options: [
            {
              title: "Measurement",
              values: ["шт."],
            },
          ],
          variants: [
            {
              title: "шт.",
              options: {
                Measurement: "шт.",
              },
              prices: [
                {
                  amount: 25,
                  currency_code: "uah",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
