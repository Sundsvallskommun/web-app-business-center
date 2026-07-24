import { enumTitles } from '@/services/jsonschema.service';

describe('jsonschema.service', () => {
  describe('enumTitles', () => {
    const schema = {
      properties: {
        // string field: oneOf directly on the property
        type: {
          oneOf: [
            { const: 'A', title: 'Alpha' },
            { const: 'B', title: 'Beta' },
          ],
        },
        // array field: oneOf under items
        aids: { items: { oneOf: [{ const: 'X', title: 'Ex' }] } },
      },
    };

    it('returns the raw values unchanged when there is no schema', () => {
      expect(enumTitles(null, 'type', ['A'])).toEqual(['A']);
    });

    it('resolves titles for a string (oneOf) field', () => {
      expect(enumTitles(schema, 'type', ['A', 'B'])).toEqual(['Alpha', 'Beta']);
    });

    it('resolves titles for an array (items.oneOf) field', () => {
      expect(enumTitles(schema, 'aids', ['X'])).toEqual(['Ex']);
    });

    it('falls back to the raw value for an unknown const', () => {
      expect(enumTitles(schema, 'type', ['A', 'Z'])).toEqual(['Alpha', 'Z']);
    });

    it('returns the values unchanged when the field is not in the schema', () => {
      expect(enumTitles(schema, 'missing', ['A'])).toEqual(['A']);
    });

    it('defaults to an empty array when no values are given', () => {
      expect(enumTitles(schema, 'type')).toEqual([]);
    });
  });
});
