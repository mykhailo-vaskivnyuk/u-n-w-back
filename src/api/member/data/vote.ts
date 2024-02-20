import Joi from 'joi';
import { THandler } from '../../../controller/types';
import {
  IMemberConfirmParams,
} from '../../../client/common/server/types/types';
import { NetEvent } from '../../../domain/event/event';
import { MemberConfirmParamsSchema } from '../../schema/schema';
import { getMemberStatus } from '../../../client/common/server/utils';

export const set: THandler<IMemberConfirmParams, boolean> = async (
  { member: m }, { node_id, member_node_id },
) => {
  const { net_id } = m!.get();
  let event!: NetEvent;
  const result = await domain.utils.exeWithNetLock(net_id, async (t) => {
    await m!.reinit();
    const { parent_node_id } = m!.get();
    if (!parent_node_id) return false; // bad request
    const [member] = await execQuery
      .member.find.inCircle([parent_node_id, member_node_id]);
    if (!member) return false; // bad request
    if (parent_node_id === member_node_id) return false; // bad request
    const memberStatus = getMemberStatus(member);
    if (memberStatus !== 'ACTIVE') return false; // bad request
    await t.execQuery.member.data.unsetVote([parent_node_id, node_id]);
    await t.execQuery
      .member.data.setVote([parent_node_id, node_id, member_node_id]);
    event = new domain.event.NetEvent(net_id, 'VOTE', m!.get());
    const net = new domain.net.NetArrange(t);
    const result = await net.checkVotes(event, parent_node_id);
    !result && await event.messages.create(t);
    await event.commit(notificationService, t);
    return true;
  });
  event.send();
  return result;
};
set.paramsSchema = MemberConfirmParamsSchema;
set.responseSchema = Joi.boolean();
set.checkNet = true;

export const unSet: THandler<IMemberConfirmParams, boolean> = async (
  { member: actionMember }, { member_node_id }
) => {
  const m = actionMember!.get();
  const { net_id, node_id, parent_node_id } = m;
  if (!parent_node_id) return false; // bad request
  const [member] = await execQuery.member
    .find.inCircle([parent_node_id, member_node_id]);
  if (!member) return false; // bad request
  const memberStatus = getMemberStatus(member);
  if (memberStatus !== 'ACTIVE') return false; // bad request
  await execQuery.member.data.unsetVote([parent_node_id, node_id]);
  const event = new domain.event.NetEvent(net_id, 'VOTE', m);
  await event.messages.create();
  await event.commit(notificationService);
  event.send();
  return true;
};
unSet.paramsSchema = MemberConfirmParamsSchema;
unSet.responseSchema = Joi.boolean();
unSet.checkNet = true;
