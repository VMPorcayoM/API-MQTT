import { BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } from "@azure/storage-blob";


export function generateSasUrl(containerName, blobName, expiresInMinutes = 1440) {
      const sharedKeyCredential = new StorageSharedKeyCredential(
        process.env.AZURE_STORAGE_ACCOUNT_NAME,
        process.env.AZURE_STORAGE_ACCOUNT_KEY
      );
    
      const sasOptions = {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"), // solo lectura
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + expiresInMinutes * 60 * 1000),
      };
    
      const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
    
      const url = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
      return url;
}