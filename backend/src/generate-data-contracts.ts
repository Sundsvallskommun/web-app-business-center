import path from 'node:path';

import { generateApi } from 'swagger-typescript-api';

import { APIS, API_BASE_URL } from './config/index';

const PATH_TO_OUTPUT_DIR = path.resolve(process.cwd(), './src/data-contracts');

const main = async () => {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is required to generate service contracts');
  }

  console.log('Downloading and generating api-docs..');

  for (const api of APIS) {
    const outputDirectory = path.join(PATH_TO_OUTPUT_DIR, api.name);
    const apiDocsUrl = new URL(`${API_BASE_URL.replace(/\/$/, '')}/${encodeURIComponent(api.name)}/${encodeURIComponent(api.version)}/api-docs`);

    await generateApi({
      url: apiDocsUrl.toString(),
      output: outputDirectory,
      fileName: 'data-contracts.ts',
      generateClient: false,
      cleanOutput: true,
      extractEnums: true,
    });

    console.log(`- ${api.name} ${api.version}`);
  }
};

main().catch((error: unknown) => {
  console.error('Data-contract generation failed:', error);
  process.exitCode = 1;
});
