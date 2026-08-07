import { config } from 'dotenv';
import path from 'node:path';
import { generateApi } from 'swagger-typescript-api';

config();

const PATH_TO_OUTPUT_DIR = path.resolve(process.cwd(), './src/data-contracts/backend');

const main = async () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is required to generate backend contracts');
  }

  const swaggerUrl = new URL(`${apiBaseUrl.replace(/\/$/, '')}/swagger.json`);
  console.log('Downloading and generating api-docs for backend');

  await generateApi({
    url: swaggerUrl.toString(),
    output: PATH_TO_OUTPUT_DIR,
    modular: true,
    generateClient: false,
  });
};

main().catch((error: unknown) => {
  console.error('Data-contract generation failed:', error);
  process.exitCode = 1;
});
