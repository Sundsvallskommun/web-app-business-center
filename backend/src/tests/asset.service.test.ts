import { ExtraParameter } from '@/data-contracts/case-data/data-contracts';
import { buildRenewalExtraParameters, ParkingPermitRenewalBody } from '@/services/asset.service';

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
});
