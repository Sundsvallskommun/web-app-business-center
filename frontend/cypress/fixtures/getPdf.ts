import { InvoicePdf } from '@interfaces/invoice';
import { ApiResponse } from '@services/api-service';

function generateMinimalPdfBase64(): string {
  const pdfContent = `%PDF-1.0
1 0 obj
<</Type /Catalog /Pages 2 0 R>>
endobj
2 0 obj
<</Type /Pages /Kids [3 0 R] /Count 1>>
endobj
3 0 obj
<</Type /Page /MediaBox [0 0 612 792] /Parent 2 0 R /Contents 4 0 R /Resources<</Font<</F1 5 0 R>>>>>>
endobj
4 0 obj
<</Length 100>>
stream
BT
/F1 24 Tf
72 720 Td
(test-pdf) Tj
ET
endstream
endobj
5 0 obj
<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000053 00000 n 
0000000164 00000 n 
0000000262 00000 n 
0000000344 00000 n 
trailer
<</Size 6 /Root 1 0 R>>
startxref
403
%%EOF
`;

  // Convert the string to a Uint8Array
  const encoder = new TextEncoder();
  const pdfBytes = encoder.encode(pdfContent);

  // Convert the Uint8Array to a base64 string
  const base64String = btoa(String.fromCharCode(...pdfBytes));

  return base64String;
}

export const getPdf: ApiResponse<InvoicePdf> = {
  data: {
    fileName: 'pdf-test.pdf',
    file: generateMinimalPdfBase64(),
  },
  message: 'success',
};
