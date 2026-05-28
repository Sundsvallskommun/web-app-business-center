import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { User } from '@/interfaces/users.interface';
import ApiService from '@/services/api.service';

interface EnumOption {
  const: string;
  title?: string;
}

// Just enough of an RJSF schema to resolve a field's enum option titles. A field
// is either a single string (oneOf directly) or an array (oneOf under items).
export interface RjsfSchema {
  properties?: Record<string, { oneOf?: EnumOption[]; items?: { oneOf?: EnumOption[] } }>;
}

const apiService = new ApiService();
const schemaBase = getApiBase('jsonschema');

// Schemas change rarely, so cache the resolved RJSF value per id for the process
// lifetime. Failed lookups are not cached, so a later request can retry.
const schemaCache = new Map<string, Promise<RjsfSchema | null>>();

const asSchema = (candidate: unknown): RjsfSchema | null => {
  if (typeof candidate === 'string') {
    try {
      return JSON.parse(candidate) as RjsfSchema;
    } catch {
      return null;
    }
  }
  if (candidate && typeof candidate === 'object') return candidate as RjsfSchema;
  return null;
};

// The RJSF schema may arrive as a JSON string or object, directly or under a
// `value`/`data` envelope depending on the upstream. Try the known shapes.
const extractSchema = (data: unknown): RjsfSchema | null => {
  const envelope = data as { value?: unknown; data?: { value?: unknown }; schema?: unknown };
  const candidates = [envelope?.value, envelope?.data?.value, envelope?.schema, data];
  for (const candidate of candidates) {
    const schema = asSchema(candidate);
    if (schema?.properties) return schema;
  }
  return null;
};

export const getRjsfSchema = (schemaId: string, user: User): Promise<RjsfSchema | null> => {
  const cached = schemaCache.get(schemaId);
  if (cached) return cached;

  const url = `${schemaBase}/${MUNICIPALITY_ID}/schemas/${schemaId}`;
  const promise = apiService
    .get<unknown>({ url }, user)
    .then(res => extractSchema(res.data))
    .catch(() => {
      schemaCache.delete(schemaId);
      return null;
    });

  schemaCache.set(schemaId, promise);
  return promise;
};

// Map enum option ids to their human-readable titles for a field, handling both
// string fields (oneOf) and array fields (items.oneOf). Falls back to the raw
// values when the schema or field definition is unavailable.
export const enumTitles = (schema: RjsfSchema | null, field: string, values: string[] = []): string[] => {
  const property = schema?.properties?.[field];
  const oneOf = property?.items?.oneOf ?? property?.oneOf;
  if (!oneOf) return values;
  return values.map(value => oneOf.find(option => option.const === value)?.title ?? value);
};
