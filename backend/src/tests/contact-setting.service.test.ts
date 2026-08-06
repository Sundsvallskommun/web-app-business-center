import { ContactMethod } from '@/data-contracts/contactsettings/data-contracts';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ContactSetting } from '@/interfaces/contact-settings';
import { ClientContactSetting } from '@/responses/contactsettings.response';
import {
  contactSettingBelongsToParty,
  deleteContactSetting,
  getContactSettingChannels,
  makeClientContactSetting,
} from '@/services/contact-setting.service';
import { createMockApiService } from './helpers/mockApiService';
import { mockUser } from './helpers/fixtures';
import { TEST_REPRESENTING_PARTY_ID } from './helpers/constants';

describe('contact-setting.service', () => {
  describe('getContactSettingChannels', () => {
    it('maps email and phone to channels with disabled = !enabled', () => {
      const userData = {
        email: 'a@b.se',
        phone: '070',
        notifications: { email_enabled: true, phone_enabled: false },
      } as ClientContactSetting;

      expect(getContactSettingChannels(userData)).toEqual([
        { contactMethod: ContactMethod.EMAIL, destination: 'a@b.se', disabled: false, alias: 'default' },
        { contactMethod: ContactMethod.SMS, destination: '070', disabled: true, alias: 'default' },
      ]);
    });

    it('omits a channel when its destination is missing', () => {
      const userData = {
        phone: '070',
        notifications: { email_enabled: true, phone_enabled: true },
      } as ClientContactSetting;

      const channels = getContactSettingChannels(userData);
      expect(channels).toHaveLength(1);
      expect(channels[0].contactMethod).toBe(ContactMethod.SMS);
    });

    it('returns an empty array when neither email nor phone is set', () => {
      const userData = { notifications: { email_enabled: true, phone_enabled: true } } as ClientContactSetting;
      expect(getContactSettingChannels(userData)).toEqual([]);
    });
  });

  describe('makeClientContactSetting', () => {
    it('derives email/phone and notification flags from the contact channels', () => {
      const contactSetting = {
        id: 'cs1',
        contactChannels: [
          { contactMethod: ContactMethod.EMAIL, destination: 'a@b.se', disabled: false, alias: 'default' },
          { contactMethod: ContactMethod.SMS, destination: '070', disabled: true, alias: 'default' },
        ],
        virtual: true,
        alias: 'myalias',
        modified: '2025-01-01',
      } as ContactSetting;

      expect(makeClientContactSetting(contactSetting)).toMatchObject({
        id: 'cs1',
        name: null,
        address: null,
        email: 'a@b.se',
        phone: '070',
        virtual: true,
        alias: 'myalias',
        notifications: { email_enabled: true, phone_enabled: false },
        decicionsAndDocuments: { digitalInbox: true, myPages: true, snailmail: false },
        modified: '2025-01-01',
      });
    });

    it('falls back to null contacts, disabled notifications and default alias when there are no channels', () => {
      const contactSetting = { contactChannels: [] } as unknown as ContactSetting;

      expect(makeClientContactSetting(contactSetting)).toMatchObject({
        email: null,
        phone: null,
        virtual: false,
        alias: 'default',
        notifications: { email_enabled: false, phone_enabled: false },
      });
    });
  });

  describe('deleteContactSetting', () => {
    const req = { user: mockUser } as unknown as RequestWithUser;

    it('throws 400 without calling the API when no id is given', async () => {
      const api = createMockApiService();

      await expect(deleteContactSetting('', req, api)).rejects.toMatchObject({ status: 400 });
      expect(api.delete).not.toHaveBeenCalled();
    });

    it('deletes the setting on its settings endpoint and returns true', async () => {
      const api = createMockApiService();
      api.delete.mockResolvedValue({ data: true });

      await expect(deleteContactSetting('cs1', req, api)).resolves.toBe(true);
      expect(api.delete).toHaveBeenCalledWith({ url: expect.stringContaining('/settings/cs1') }, mockUser);
    });

    it('still resolves true when the delete call fails (error is swallowed)', async () => {
      const api = createMockApiService();
      api.delete.mockRejectedValue(new Error('delete down'));

      await expect(deleteContactSetting('cs1', req, api)).resolves.toBe(true);
    });
  });

  describe('contactSettingBelongsToParty', () => {
    it('returns true when the party owns a setting with the given id', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: [{ id: 'cs1', partyId: TEST_REPRESENTING_PARTY_ID }] });

      await expect(contactSettingBelongsToParty(TEST_REPRESENTING_PARTY_ID, 'cs1', mockUser, api)).resolves.toBe(true);
      // The ownership lookup is scoped to the party.
      expect(api.get).toHaveBeenCalledWith(
        { url: expect.stringContaining('/settings'), params: expect.objectContaining({ partyId: TEST_REPRESENTING_PARTY_ID }) },
        mockUser,
      );
    });

    it("returns false when the id is not among the party's settings", async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: [{ id: 'other', partyId: TEST_REPRESENTING_PARTY_ID }] });

      await expect(contactSettingBelongsToParty(TEST_REPRESENTING_PARTY_ID, 'cs1', mockUser, api)).resolves.toBe(false);
    });

    it('returns false when a setting with the id exists but belongs to another party', async () => {
      const api = createMockApiService();
      api.get.mockResolvedValue({ data: [{ id: 'cs1', partyId: 'someone-else' }] });

      await expect(contactSettingBelongsToParty(TEST_REPRESENTING_PARTY_ID, 'cs1', mockUser, api)).resolves.toBe(false);
    });

    it('fails closed (returns false) when the settings lookup throws', async () => {
      const api = createMockApiService();
      api.get.mockRejectedValue(new Error('settings down'));

      await expect(contactSettingBelongsToParty(TEST_REPRESENTING_PARTY_ID, 'cs1', mockUser, api)).resolves.toBe(false);
    });
  });
});
