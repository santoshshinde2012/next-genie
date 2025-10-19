/**
 * Databricks configuration
 */
export const databricksConfig = {
  host: process.env.DATABRICKS_HOST || '',
  token: process.env.DATABRICKS_TOKEN || '',
  spaceId: process.env.DATABRICKS_SPACE_ID || '',
};

export function validateDatabricksConfig(): boolean {
  return !!(
    databricksConfig.host &&
    databricksConfig.token &&
    databricksConfig.spaceId &&
    databricksConfig.host !== 'https://your-workspace.databricks.com' &&
    databricksConfig.token !== 'your-databricks-access-token' &&
    databricksConfig.spaceId !== 'your-genie-space-id'
  );
}

export function getDatabricksConfig() {
  if (!validateDatabricksConfig()) {
    throw new Error(
      'Missing Databricks configuration. Please set DATABRICKS_HOST, DATABRICKS_TOKEN, and DATABRICKS_SPACE_ID environment variables.'
    );
  }
  return databricksConfig;
}

