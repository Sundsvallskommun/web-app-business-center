/**
 * Downloads a base64-encoded file as a blob.
 * Uses blob URLs instead of data URIs for iOS Safari compatibility.
 */
export function downloadBlob(base64: string, contentType: string, filename: string) {
  const byteCharacters = atob(base64);
  const byteArray = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: contentType });
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.click();

  // Clean up
  setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
}
