const { BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } = require("@azure/storage-blob");


function generateSasUrl(containerName, blobName, expiresInDays = 365) {
      const sharedKeyCredential = new StorageSharedKeyCredential(
        process.env.AZURE_STORAGE_ACCOUNT_NAME,
        process.env.AZURE_STORAGE_ACCOUNT_KEY
      );
      const now = new Date();
      const expiresOn = new Date(now);
      expiresOn.setDate(now.getDate() + expiresInDays); // suma 365 días
    
      const sasOptions = {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"), // solo lectura
        startsOn: now,
        expiresOn,
      };
    
      const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
    
      const url = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
      return url;
}
module.exports = {
  generateSasUrl,
};