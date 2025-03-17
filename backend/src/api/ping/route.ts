import { MedusaRequest, MedusaResponse } from '@medusajs/framework';

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    res.sendStatus(200).send('pong');
  } catch (err) {
    return;
  }
}