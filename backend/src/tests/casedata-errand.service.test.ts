import { Errand, Stakeholder, StakeholderTypeEnum } from '@/data-contracts/case-data/data-contracts';
import { CaseDataNamespace, StakeholderRole } from '@/interfaces/casedata.interface';
import { fetchErrandById } from '@/services/casedata-errand.service';
import { createMockApiService } from './helpers/mockApiService';
import { mockUser } from './helpers/fixtures';
import { TEST_OTHER_PARTY_ID, TEST_USER_PARTY_ID } from './helpers/constants';

const ERRAND_ID = '5115';
const NAMESPACE = CaseDataNamespace.SBK_PARKING_PERMIT;

const stakeholder = (personId: string, roles: string[] = [StakeholderRole.APPLICANT]): Stakeholder => ({
  type: StakeholderTypeEnum.PERSON,
  roles,
  personId,
});

const errandWith = (stakeholders: Stakeholder[]): Errand => ({
  id: Number(ERRAND_ID),
  namespace: NAMESPACE,
  stakeholders,
  extraParameters: [{ key: 'caseMeaning', values: ['Behöver tillstånd'] }],
});

const respondWith = (errand?: Errand) => Promise.resolve({ data: errand, message: 'success' });

describe('casedata-errand.service', () => {
  describe('fetchErrandById', () => {
    it('returns the errand when the applicant is the represented party', async () => {
      const api = createMockApiService();
      const errand = errandWith([stakeholder(TEST_USER_PARTY_ID)]);
      api.get.mockReturnValue(respondWith(errand));

      await expect(fetchErrandById(ERRAND_ID, NAMESPACE, TEST_USER_PARTY_ID, mockUser, api)).resolves.toEqual(errand);
    });

    it('requests the errand by namespace and id, passing the user through', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith(errandWith([stakeholder(TEST_USER_PARTY_ID)])));

      await fetchErrandById(ERRAND_ID, NAMESPACE, TEST_USER_PARTY_ID, mockUser, api);

      expect(api.get).toHaveBeenCalledWith(expect.objectContaining({ url: expect.stringContaining(`/${NAMESPACE}/errands/${ERRAND_ID}`) }), mockUser);
    });

    it('matches the applicant personId regardless of casing', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith(errandWith([stakeholder(TEST_USER_PARTY_ID.toUpperCase())])));

      await expect(fetchErrandById(ERRAND_ID, NAMESPACE, TEST_USER_PARTY_ID, mockUser, api)).resolves.toBeDefined();
    });

    it('accepts an applicant that also holds other roles', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith(errandWith([stakeholder(TEST_USER_PARTY_ID, ['DRIVER', StakeholderRole.APPLICANT])])));

      await expect(fetchErrandById(ERRAND_ID, NAMESPACE, TEST_USER_PARTY_ID, mockUser, api)).resolves.toBeDefined();
    });

    it('returns undefined when the applicant is another party', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith(errandWith([stakeholder(TEST_OTHER_PARTY_ID)])));

      await expect(fetchErrandById(ERRAND_ID, NAMESPACE, TEST_USER_PARTY_ID, mockUser, api)).resolves.toBeUndefined();
    });

    it('returns undefined when the party is a stakeholder in some other role', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith(errandWith([stakeholder(TEST_OTHER_PARTY_ID), stakeholder(TEST_USER_PARTY_ID, ['CONTACT_PERSON'])])));

      await expect(fetchErrandById(ERRAND_ID, NAMESPACE, TEST_USER_PARTY_ID, mockUser, api)).resolves.toBeUndefined();
    });

    it('returns undefined when the errand has no applicant', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith(errandWith([stakeholder(TEST_USER_PARTY_ID, ['CONTACT_PERSON'])])));

      await expect(fetchErrandById(ERRAND_ID, NAMESPACE, TEST_USER_PARTY_ID, mockUser, api)).resolves.toBeUndefined();
    });

    it('returns undefined when the errand has multiple applicants, even if one matches', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith(errandWith([stakeholder(TEST_USER_PARTY_ID), stakeholder(TEST_OTHER_PARTY_ID)])));

      await expect(fetchErrandById(ERRAND_ID, NAMESPACE, TEST_USER_PARTY_ID, mockUser, api)).resolves.toBeUndefined();
    });

    it('returns undefined when no partyId is given', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith(errandWith([stakeholder(TEST_USER_PARTY_ID)])));

      await expect(fetchErrandById(ERRAND_ID, NAMESPACE, '', mockUser, api)).resolves.toBeUndefined();
    });

    it('returns undefined when the errand has no stakeholders at all', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith({ id: Number(ERRAND_ID), namespace: NAMESPACE }));

      await expect(fetchErrandById(ERRAND_ID, NAMESPACE, TEST_USER_PARTY_ID, mockUser, api)).resolves.toBeUndefined();
    });

    it('returns undefined when the API responds without data', async () => {
      const api = createMockApiService();
      api.get.mockReturnValue(respondWith(undefined));

      await expect(fetchErrandById(ERRAND_ID, NAMESPACE, TEST_USER_PARTY_ID, mockUser, api)).resolves.toBeUndefined();
    });

    it('returns undefined instead of throwing when the API fails', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue(new Error('case-data unavailable'));

      await expect(fetchErrandById(ERRAND_ID, NAMESPACE, TEST_USER_PARTY_ID, mockUser, api)).resolves.toBeUndefined();
    });

    it.each([
      ['a different namespace', CaseDataNamespace.SBK_MEX],
      ['the allowed namespace in the wrong case', 'sbk_parking_permit'],
      ['the allowed namespace with a trailing space', 'SBK_PARKING_PERMIT '],
      ['an empty namespace', ''],
    ])('does not call the API for %s', async (_label, namespace) => {
      const api = createMockApiService();

      await expect(fetchErrandById(ERRAND_ID, namespace, TEST_USER_PARTY_ID, mockUser, api)).resolves.toBeUndefined();
      expect(api.get).not.toHaveBeenCalled();
    });

    it('does not call the API without an errand id', async () => {
      const api = createMockApiService();

      await expect(fetchErrandById('', NAMESPACE, TEST_USER_PARTY_ID, mockUser, api)).resolves.toBeUndefined();
      expect(api.get).not.toHaveBeenCalled();
    });
  });
});
