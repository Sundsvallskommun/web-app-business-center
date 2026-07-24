import { ExtraParameter } from '@/data-contracts/case-data/data-contracts';
import { Asset, Status } from '@/data-contracts/partyassets/data-contracts';
import {
  buildRenewalExtraParameters,
  isAllowedAsset,
  isVisibleStatus,
  ParkingPermitRenewalBody,
  toClientAsset,
  toServiceDetails,
  toVisibleAssets,
} from '@/services/asset.service';
import { mockUser } from './helpers/fixtures';

// 'PARKINGPERMIT' is the single whitelisted type wired up in tests/setup.ts.
const ALLOWED_TYPE = 'PARKINGPERMIT';

// Asset carrying a single jsonParameters entry (the shape toServiceDetails reads).
// `value` may be a JSON string or an already-parsed object; schemaId is omitted so
// no RJSF schema is fetched and enum titles fall back to the raw values.
const serviceAsset = (value: unknown): Asset => ({ jsonParameters: [{ value }] } as unknown as Asset);

const findValues = (params: ExtraParameter[], key: string) => params.find(p => p.key === key)?.values;

describe('asset.service', () => {
  describe('buildRenewalExtraParameters', () => {
    it('maps every renewal field to its Draken extraParameter key', () => {
      const body: ParkingPermitRenewalBody = {
        circumstancesChanged: 'TRUE',
        date: '2025-10-23',
        walkingAids: JSON.stringify(['Rullator', 'Elrullstol']),
        caseMeaning: 'Sammanfattning',
        capacity: 'PASSENGER',
        reason: 'Försämrad rörlighet',
        walkingAbility: 'false',
        walkingDistanceBeforeRest: '50',
        walkingDistanceMax: '120',
        duration: 'P2Y',
        canBeAloneWhileParking: 'false',
        canBeAloneWhileParkingNote: 'Behöver assistans',
        consentContactDoctor: 'true',
        consentViewTransportationService: 'false',
        signingAbility: 'true',
        medicalConfirmationRequired: 'yes',
      };

      const params = buildRenewalExtraParameters(body);

      expect(params).toEqual(
        expect.arrayContaining([
          { key: 'application.reason', values: ['Försämrad rörlighet'] },
          { key: 'caseMeaning', values: ['Sammanfattning'] },
          { key: 'application.applicant.capacity', values: ['PASSENGER'] },
          { key: 'disability.walkingAbility', values: ['false'] },
          { key: 'disability.walkingDistance.beforeRest', values: ['50'] },
          { key: 'disability.walkingDistance.max', values: ['120'] },
          { key: 'disability.duration', values: ['P2Y'] },
          { key: 'disability.canBeAloneWhileParking', values: ['false'] },
          { key: 'disability.canBeAloneWhileParking.note', values: ['Behöver assistans'] },
          { key: 'consent.contact.doctor', values: ['true'] },
          { key: 'consent.view.transportationServiceDetails', values: ['false'] },
          { key: 'application.applicant.signingAbility', values: ['true'] },
          { key: 'application.renewal.expirationDate', values: ['2025-10-23'] },
          { key: 'application.renewal.medicalConfirmationRequired', values: ['yes'] },
          { key: 'application.renewal.changedCircumstances', values: ['Y'] },
          { key: 'disability.aid', values: ['Rullator', 'Elrullstol'] },
        ]),
      );
    });

    it('converts the legacy circumstancesChanged TRUE/FALSE wire value to Draken Y/N', () => {
      expect(findValues(buildRenewalExtraParameters({ circumstancesChanged: 'TRUE' }), 'application.renewal.changedCircumstances')).toEqual(['Y']);
      expect(findValues(buildRenewalExtraParameters({ circumstancesChanged: 'FALSE' }), 'application.renewal.changedCircumstances')).toEqual(['N']);
    });

    it('omits the changedCircumstances parameter for unexpected values', () => {
      const params = buildRenewalExtraParameters({ circumstancesChanged: 'Y' });
      expect(params.some(p => p.key === 'application.renewal.changedCircumstances')).toBe(false);
    });

    it('omits empty and absent fields', () => {
      const params = buildRenewalExtraParameters({ reason: '', capacity: 'DRIVER' });

      expect(params.some(p => p.key === 'application.reason')).toBe(false);
      expect(params).toEqual([{ key: 'application.applicant.capacity', values: ['DRIVER'] }]);
    });

    it('parses walkingAids JSON into a values array and skips it when empty', () => {
      expect(findValues(buildRenewalExtraParameters({ walkingAids: JSON.stringify(['Inget']) }), 'disability.aid')).toEqual(['Inget']);
      expect(findValues(buildRenewalExtraParameters({ walkingAids: JSON.stringify(['Rullator', 'Krycka/kryckor/käpp']) }), 'disability.aid')).toEqual(
        ['Rullator', 'Krycka/kryckor/käpp'],
      );
      expect(buildRenewalExtraParameters({ walkingAids: JSON.stringify([]) }).some(p => p.key === 'disability.aid')).toBe(false);
    });

    it('skips walkingAids when the JSON is invalid', () => {
      const params = buildRenewalExtraParameters({ walkingAids: 'not-json' });
      expect(params.some(p => p.key === 'disability.aid')).toBe(false);
    });

    it('returns an empty array for an empty body', () => {
      expect(buildRenewalExtraParameters({})).toEqual([]);
    });
  });

  describe('isAllowedAsset', () => {
    it('allows only whitelisted types', () => {
      expect(isAllowedAsset({ type: ALLOWED_TYPE } as Asset)).toBe(true);
      expect(isAllowedAsset({ type: 'SOMETHING_ELSE' } as Asset)).toBe(false);
    });

    it('rejects assets without a type', () => {
      expect(isAllowedAsset({} as Asset)).toBe(false);
    });
  });

  describe('isVisibleStatus', () => {
    it('hides DRAFT and REPLACED assets', () => {
      expect(isVisibleStatus({ status: Status.DRAFT } as Asset)).toBe(false);
      expect(isVisibleStatus({ status: Status.REPLACED } as Asset)).toBe(false);
    });

    it('shows other statuses and hides assets with no status', () => {
      expect(isVisibleStatus({ status: Status.ACTIVE } as Asset)).toBe(true);
      expect(isVisibleStatus({ status: Status.BLOCKED } as Asset)).toBe(true);
      expect(isVisibleStatus({} as Asset)).toBe(false);
    });
  });

  describe('toClientAsset', () => {
    it('strips partyId and jsonParameters without mutating the input', () => {
      const asset = { id: '1', type: ALLOWED_TYPE, partyId: 'secret', jsonParameters: [{ value: '{}' }] } as unknown as Asset;

      const client = toClientAsset(asset);

      expect(client).toEqual({ id: '1', type: ALLOWED_TYPE });
      expect(asset.partyId).toBe('secret');
      expect(asset.jsonParameters).toHaveLength(1);
    });
  });

  describe('toVisibleAssets', () => {
    it('keeps only assets that are allowed, visible and addressable', () => {
      const keep = { id: 'ok', type: ALLOWED_TYPE, status: Status.ACTIVE } as Asset;
      const assets: Asset[] = [
        keep,
        { id: 'a', type: 'SOMETHING_ELSE', status: Status.ACTIVE } as Asset, // not whitelisted
        { id: 'b', type: ALLOWED_TYPE, status: Status.DRAFT } as Asset, // hidden status
        { id: 'c', type: ALLOWED_TYPE, status: Status.REPLACED } as Asset, // hidden status
        { type: ALLOWED_TYPE, status: Status.ACTIVE } as Asset, // no id -> not addressable
      ];

      expect(toVisibleAssets(assets)).toEqual([keep]);
    });
  });

  describe('toServiceDetails', () => {
    it('returns undefined when there is no jsonParameters value', async () => {
      await expect(toServiceDetails({} as Asset, mockUser)).resolves.toBeUndefined();
      await expect(toServiceDetails({ jsonParameters: [{}] } as unknown as Asset, mockUser)).resolves.toBeUndefined();
    });

    it('returns undefined when the value is invalid JSON', async () => {
      await expect(toServiceDetails(serviceAsset('not-json'), mockUser)).resolves.toBeUndefined();
    });

    it('normalizes string, array and {value|key} entries and passes values through when there is no schema', async () => {
      const asset = serviceAsset(
        JSON.stringify({
          type: ['A', 'B'],
          transportMode: 'X',
          mobilityAids: [{ value: 'aid1' }, { key: 'aid2' }, 42],
          additionalAids: [],
          notes: 'a comment',
          isWinterService: 'nej',
        }),
      );

      await expect(toServiceDetails(asset, mockUser)).resolves.toEqual({
        restyp: ['A', 'B'],
        transportMode: ['X'],
        aids: ['aid1', 'aid2'],
        addon: [],
        comment: 'a comment',
        isWinterService: false,
      });
    });

    it('accepts an already-parsed object value and defaults a missing comment to an empty string', async () => {
      await expect(toServiceDetails(serviceAsset({ type: 'A' }), mockUser)).resolves.toMatchObject({
        restyp: ['A'],
        comment: '',
      });
    });

    it.each([
      ['string "ja"', { isWinterService: 'ja' }],
      ['boolean true', { isWinterService: true }],
      ['validityType vinterfardtjanst', { validityType: 'vinterfardtjanst' }],
    ])('flags winter service for %s', async (_label, formData) => {
      const result = await toServiceDetails(serviceAsset(JSON.stringify(formData)), mockUser);
      expect(result?.isWinterService).toBe(true);
    });
  });
});
