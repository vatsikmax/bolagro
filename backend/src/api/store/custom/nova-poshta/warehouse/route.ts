// src/api/store/external-service/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const baseURL = 'https://api.novaposhta.ua/v2.0/json/';

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { town, warehouse } = req.query;
    const сity = town ? { CityName: town } : {};
    const findByStringProperties = town ? { FindByString: warehouse } : {};
    const response = await fetch(baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: process.env.NOVA_POSHTA_API_KEY,
        modelName: "AddressGeneral",
        calledMethod: "getWarehouses",
        methodProperties: {
          ...сity,
          ...findByStringProperties,
          Page: 1,
          Limit: 50
        }
      })
    })

    const data = await response.json()

    res.json({
      success: true,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch data from nova poshta service",
      error: error.message
    })
  }
}
