import { loadEnv, defineConfig } from '@medusajs/framework/utils'

const orderPlacedHtmlTemplate = `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Деталі замовлення</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        pre {
            background: #f4f4f4;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: auto;
        }
        h2 {
            color: #333;
        }
    </style>
</head>
<body>
    <h1>Деталі замовлення</h1>
    <div id="custom-explanation"></div>
            <p><strong>Дата:</strong> {{ order.created_at }}</p>
            <h3>Товари: </h3>
    <table id="itemsTable">
        <thead>
            <tr>
                <th>Назва</th>
                <th>Ціна ( {{order.currency_code }})</th>
                <th>Кількість</th>
                <th>Загалом ({{ order.currency_code }})</th>
            </tr>
        </thead>
        <tbody>
            {{#each order.items}}
              <tr>
                <td>{{ product_title }}</td>
                <td>{{ unit_price }}</td>
                <td>{{ quantity }}</td>
                <td>{{ total }}</td>
              </tr>
            {{/each}}
        </tbody>
    </table>            
            <h3>Адреса доставки:</h3>
            <p>
                {{ order.shipping_address.address_1 }} {{ order.shipping_address.address_2 }}
                {{ order.shipping_address.city }}<br>
                Телефон: {{ order.shipping_address.phone }}
            </p>
                {{ order.shipping_address.first_name }} {{ order.shipping_address.last_name }}
            <p>
            </p>
            <h3>Сервіс доставки:</h3>
            <p>{{ order.shipping_methods.[0].name }}</p>
            <h3>До оплати:</h3>

    <table id="priceTable">
        <thead>
            <tr>
                <th>Доставка ({{ order.currency_code }})</th>
                <th>Ціна товарів ({{ order.currency_code }})</th>
                <th>Загалом ({{ order.currency_code }})</th>
            <tr>
                <td>{{ order.shipping_total }}</td>
                <td>{{ order.subtotal }}</td>
                <td>{{ order.total }}</td>
            </tr>
        </thead>
        <tbody></tbody>
    </table>            
            <h3>Дякуємо за замовлення, ми незабаром зв'яжемося з вами</h3>
</body>
</html>`


loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    backendUrl: process.env.BACKEND_URL,
  },
  projectConfig: {
    redisUrl: process.env.REDIS_URL,
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions:
      process.env.NODE_ENV !== 'development'
        ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
        : {},
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [{
    resolve: "@medusajs/medusa/fulfillment",
    options: {
      providers: [
        // default provider
        {
          resolve: "@medusajs/medusa/fulfillment-manual",
          id: "manual",
        },
      ]
    }
  },
  {
    resolve: "@medusajs/medusa/notification",
    options: {
      providers: [
        {
          resolve: "./src/modules/ukrnet-mail",
          id: "ukrnet-mail",
          options: {
            channels: ["email"],
            from: `Mагазин Болагро <${process.env.MAILBOX_USER}>`,
            smtp_host: process.env.MAILBOX_HOST,
            smtp_port: "465",
            smtp_user: process.env.MAILBOX_USER,
            smtp_pass: process.env.MAILBOX_PASS,
            // Optional: Add HTML templates
            html_templates: {
              "order-placed": {
                subject: "Деталі замовлення, магазин Болагро",
                content: orderPlacedHtmlTemplate
              },
              // Add more templates as needed
            }
          },
        },
      ],
    },
  },
  {
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "./src/modules/liqpay",
          id: "liqpay",
          options: {
            privateKey: process.env.LIQPAY_PRIVATE_KEY,
          },
        },
      ],
    },
  },
  ]
})
