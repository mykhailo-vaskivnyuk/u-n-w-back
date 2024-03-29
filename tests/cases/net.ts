import { ITestUnitsMap } from '../types/test.units.types';
import { ITestCase } from '../types/types';

export const netCases = (units: ITestUnitsMap): ITestCase[] => [
  {
    title: 'Test LEAVE NET over WS',
    dbDataFile: 'restore.sh',
    connection: 'ws',
    connCount: 3,
    caseUnits: [
      [units.account.login.user(1), 0],
      [units.account.login.user(2), 1],
      [units.account.login.user(3), 2],
      [units.net.enter(1), 0],
      [units.net.enter(1), 1],
      [units.net.enter(1), 2],
      [units.net.leave, 1],
      [units.events.newEvents, 0],
      [units.events.newEvents, 2],
      [units.events.read.leave.inTree, 0],
      [units.events.read.leave.inCircle, 2],
      [units.events.check.confirmed, 0],
    ],
  },
];
