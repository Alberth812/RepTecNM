function getRequiredEnv(name: string): string {
 const value = process.env[name];
 if (!value) {
 throw new Error(`Falta la variable de entorno: ${name}`);
 }
 return value;
}

function getBooleanEnv(name: string, defaultValue: boolean): boolean {
 const value = process.env[name];
 if (value === undefined) return defaultValue;
 if (value === "true") return true;
 if (value === "false") return false;
 throw new Error(`La variable de entorno ${name} debe ser "true" o "false".`);
}

export type StorageTarget = "afiliados" | "cms";

interface BucketCredentials {
 bucket: string;
 accessKeyId: string;
 secretAccessKey: string;
}

function getBucketCredentials(envPrefix: string): BucketCredentials {
 return {
 bucket: getRequiredEnv(`S3_${envPrefix}_BUCKET`),
 accessKeyId: getRequiredEnv(`S3_${envPrefix}_ACCESS_KEY_ID`),
 secretAccessKey: getRequiredEnv(`S3_${envPrefix}_SECRET_ACCESS_KEY`),
 };
}

export const storageConfig = {
 internalEndpoint: getRequiredEnv("S3_INTERNAL_ENDPOINT"),
 publicEndpoint: getRequiredEnv("S3_PUBLIC_ENDPOINT"),
 region: getRequiredEnv("S3_REGION"),
 forcePathStyle: getBooleanEnv("S3_FORCE_PATH_STYLE", true),

 buckets: {
 afiliados: getBucketCredentials("AFFILIATES"),
 cms: getBucketCredentials("CMS"),
 } satisfies Record<StorageTarget, BucketCredentials>,
};
