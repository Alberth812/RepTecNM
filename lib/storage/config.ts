function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno: ${name}`);
  }

  return value;
}

function getBooleanEnv(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];

  if (value === undefined) {
    return defaultValue;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`La variable de entorno ${name} debe ser "true" o "false".`);
}

export const storageConfig = {
  internalEndpoint: getRequiredEnv("S3_INTERNAL_ENDPOINT"),
  publicEndpoint: getRequiredEnv("S3_PUBLIC_ENDPOINT"),

  region: getRequiredEnv("S3_REGION"),

  accessKeyId: getRequiredEnv("S3_ACCESS_KEY_ID"),
  secretAccessKey: getRequiredEnv("S3_SECRET_ACCESS_KEY"),

  bucket: getRequiredEnv("S3_BUCKET"),

  forcePathStyle: getBooleanEnv("S3_FORCE_PATH_STYLE", true),
};
