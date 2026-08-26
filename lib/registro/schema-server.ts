import { checkImageDimensionsServer } from "./photo-validator";
import { buildRegistroSchema } from "./schema";

export const registroServerSchema = buildRegistroSchema({
  checkImageDimensions: checkImageDimensionsServer,
});
