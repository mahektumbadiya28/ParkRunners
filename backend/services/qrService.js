import crypto from 'crypto';

export const generateQRCode = (data) => {
  // Placeholder for real QR code generation (e.g. using 'qrcode' package)
  // For now, return a mock QR string
  return `QR_${crypto.createHash('md5').update(data).digest('hex')}`;
};

export const verifyQRCode = (qrString, expectedData) => {
  // Placeholder for QR verification
  const expectedQR = `QR_${crypto.createHash('md5').update(expectedData).digest('hex')}`;
  return qrString === expectedQR;
};
