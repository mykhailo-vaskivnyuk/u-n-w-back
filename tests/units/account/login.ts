import { IOperationData, TTestUnit } from '../../types/types';

const user = (user: number): TTestUnit => (state: any) => (
  {
    title: `login user ${user}`,
    operations: [
      {
        name: '/health',
        params: {},
        expected: 'API IS READY',
      },
      {
        name: '/account/login',
        params: {
          email: `user${String(user).padStart(2, '0')}@gmail.com`,
          password: '12345',
        },
        expected: {
          email: `user${String(user).padStart(2, '0')}@gmail.com`,
          mobile: null,
          name: null,
          user_id: user,
          user_status: 'LOGGEDIN',
          chat_id: null,
        },
        setToState: (actual) => state.user_id = actual.user_id,
      },
      {
        name: '/chat/connect/user',
        params: {},
      },
      {
        name: '/chat/connect/nets',
        params: {},
        setToState: (actual) => {
          state.chats || (state.chats = {});
          actual.forEach((net: any) => state.chats[net.net_id] = net);
        },
      }
    ] as IOperationData[],
  });

export const user01 = user(1);
export const user02 = user(2);
export const user03 = user(3);
export const user04 = user(4);