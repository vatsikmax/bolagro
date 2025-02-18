import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const { data: apiKeys } = await query.graph({
      entity: 'api_key',
      fields: ['token'],
    });
    try {
      res.send(apiKeys[0].token);
    } catch (err) {
      throw Error('Can not fetch api_key token from DB table\n' + err.stack);
    }
  }
}