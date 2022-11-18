import Joi from 'joi';
import { THandler } from '../../router/types';

const remove: THandler = async (context) => {
  const user_id = await context.session.read('user_id');
  if (!user_id) return false;
  await context.session.clear();
  await execQuery.node.removeUser([user_id]);
  await execQuery.user.remove([user_id]);
  return true;
};
remove.responseSchema = Joi.boolean();
remove.allowedForUser = 'NOT_CONFIRMED';

export = remove;
