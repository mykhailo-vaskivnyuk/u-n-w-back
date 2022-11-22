import Joi from 'joi';
import { IUserResponse } from '../../client/common/api/types/account.types';
import { TJoiSchema } from '../../router/types';
import { OmitNull } from '../../client/common/types';
import { JOI_NULL } from '../../router/constants';

export const UserResponseSchema = [
  JOI_NULL,
  {
    email: Joi.string(),
    name: [Joi.string(), JOI_NULL],
    mobile: [Joi.string(), JOI_NULL],
    net_name: [Joi.string(), JOI_NULL],
    user_state: Joi.string(),
    net_id: Joi.number(),
  } as Record<keyof OmitNull<IUserResponse>, TJoiSchema>,
];

export const SignupParamsSchema = {
  email: Joi.string().required().email(),
};

export const LoginParamsSchema = {
  ...SignupParamsSchema,
  password: Joi.string().required(),
};

export const ConfirmParamsSchema = {
  token: Joi.string(),
};
