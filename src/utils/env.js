/**
 * Utility for environment variable validation
 */

/**
 * Validates required environment variables
 * @param {Object} envVars - Object containing environment variables to validate
 */
export function validateEnvVars(envVars) {
  for (const [name, value] of Object.entries(envVars)) {
    if (!value) {
      console.error(`Environment variable ${name} is not set`);
      process.exit(1);
    }
  }
}

export default {
  validateEnvVars,
};
