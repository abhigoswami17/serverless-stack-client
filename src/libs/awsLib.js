import { Storage } from 'aws-amplify';

export const s3Upload = async (file) => {
  const fileName = `${Date.now()}-${file.name}`;

  const storedFile = await Storage.vault.put(fileName, file, {
    contentType: file.type,
  });

  return storedFile.key;
};
