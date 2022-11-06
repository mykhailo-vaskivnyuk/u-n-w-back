import fsp from 'node:fs/promises';
import path from 'node:path';

export const copyDir = async (
  dirFrom: string,
  dirTo: string,
  include: string[] | null = null,
  exclude: string[] | null = null,
) => {
  const dir = await fsp.opendir(dirFrom);
  let counter = 0;
  for await (const item of dir) {
    const { name } = item;
    if (item.isDirectory()) {
      const nextDirFrom = path.join(dirFrom, name);
      const nextDirTo = path.join(dirTo, name);
      console.log('[o] read', nextDirFrom);
      let created = false;
      try {
        await fsp.access(nextDirTo);
      } catch (e) {
        console.log('[+] create dir', nextDirTo);
        await fsp.mkdir(nextDirTo);
        created = true;
      }
      const count = await copyDir(
        nextDirFrom, nextDirTo, include, exclude,
      );
      if (!count && created) {
        console.log('[-] remove dir:', nextDirTo);
        await fsp.rmdir(nextDirTo);
      }
      counter += count;
      continue;
    }
    if (exclude && exclude.includes(dirFrom)) continue;
    if (include && !include.includes(dirFrom)) continue;
    const filePathFrom = path.join(dirFrom, name);
    const filePathTo = path.join(dirTo, name);
    fsp.copyFile(filePathFrom, filePathTo);
    counter++;
    console.log('--> copying', name);
  }
  console.log('<> total:', counter, dirFrom);
  return counter;
};

export const logFromTo = (from: string, to: string) => {
  console.log('\nfrom', from);
  console.log('to', to, '\n');
};

export const rmDir = async (dirToDel: string) => {
  const dir = await fsp.opendir(dirToDel);
  let counter = 0;
  for await (const item of dir) {
    const { name } = item;
    if (item.isDirectory()) {
      const nextDirToDel = path.join(dirToDel, name);
      const count = await rmDir(nextDirToDel);
      counter += count;
      continue;
    }
    const filePathToDel = path.join(dirToDel, name);
    await fsp.rm(filePathToDel);
    counter++;
  }
  await fsp.rmdir(dirToDel);
  return counter;
};
