import Joi from 'joi';
import { INetReadParams } from '../../client/common/api/types/types';
import { THandler } from '../../router/types';
import { NetReadParamsSchema } from '../schema/schema';
import { removeNetUser } from '../utils/net.utils';
import { arrangeNodes } from '../utils/utils';

const leave: THandler<INetReadParams> = async (
  { session, userNet },
) => {
  const user_id = session.read('user_id')!;
  const { net_node_id } = userNet!;
  const nodesToArrange = await removeNetUser(user_id, net_node_id);
  await arrangeNodes(nodesToArrange);
  return true;
};
leave.paramsSchema = NetReadParamsSchema;
leave.responseSchema = Joi.boolean();

export = leave;
