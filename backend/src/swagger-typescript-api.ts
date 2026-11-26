import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'node:fs';

import { APIS, API_BASE_URL } from './config/index';

const execAsync = promisify(exec);

const PATH_TO_OUTPUT_DIR = path.resolve(process.cwd(), './src/data-contracts');

const generateContract = async (name: string, swaggerUrl: string) => {
  const outputDir = `${PATH_TO_OUTPUT_DIR}/${name}`;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // -f: fail on HTTP errors, -sS: quiet but still print errors. Awaited so the
    // generate step below never runs against a half-written / stale swagger.json.
    await execAsync(`curl -fsS -o ${outputDir}/swagger.json ${swaggerUrl}`);
    console.log(`- downloaded ${name} from ${swaggerUrl}`);
  } catch (error) {
    console.log(`error downloading ${name} (${swaggerUrl}): ${(error as Error).message}`);
    return;
  }

  try {
    const { stdout } = await execAsync(
      `npx swagger-typescript-api generate --path ${outputDir}/swagger.json --output ${outputDir} --name data-contracts.ts --no-client --clean-output --extract-enums`,
    );
    console.log(`Data-contract-generator: ${stdout}`);
  } catch (error) {
    console.log(`error generating ${name}: ${(error as Error).message}`);
  }
};

const main = async () => {
  console.log('Downloading and generating api-docs..');

  // Gateway APIs — fetched through the shared API gateway (API_BASE_URL).
  for (const api of APIS) {
    await generateContract(api.name, `${API_BASE_URL}/${api.name}/${api.version}/api-docs`);
  }
};

main();
