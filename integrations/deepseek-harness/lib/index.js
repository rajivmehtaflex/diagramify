import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

export const name = 'diagramify-dsh';
export const PACKAGE_NAME = '@rajivmehtaflex/diagramify-dsh';

export function resolveDiagramifySkillRoot(profileBaseUrl) {
  if (!profileBaseUrl) {
    throw new Error('diagramify-dsh: missing DSH profile baseUrl for package resolution');
  }
  let manifestPath;
  try {
    manifestPath = createRequire(profileBaseUrl).resolve(`${PACKAGE_NAME}/package.json`);
  } catch (error) {
    throw new Error(
      `diagramify-dsh: cannot resolve ${PACKAGE_NAME}/package.json from the DSH profile`,
      { cause: error },
    );
  }
  return join(dirname(manifestPath), 'skills');
}
