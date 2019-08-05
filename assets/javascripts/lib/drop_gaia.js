import { privateUserSession } from './blockstack_client';

const deleteFiles = async (files) => {
  if (files.length === 0) { return; }

  await privateUserSession.deleteFile(files.pop());
  setTimeout(() => deleteFiles(files), 400);
}

const DropGaia = {
  call: async () => {
    const files = [];

    await privateUserSession.listFiles(path => files.push(path));
    return await deleteFiles(files);
  }
}

export default DropGaia;
