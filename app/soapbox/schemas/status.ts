import { z } from 'zod';

import { normalizeStatus } from 'soapbox/normalizers';
import { toSchema } from 'soapbox/utils/normalizers';

const statusSchema = toSchema(normalizeStatus);

type Status = z.infer<typeof statusSchema>;

export { statusSchema, type Status };