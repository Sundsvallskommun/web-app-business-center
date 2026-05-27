import { Asset, Status } from '@/data-contracts/partyassets/data-contracts';

export const mockAssets: Asset[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    assetId: 'TEST-000000001',
    origin: 'TESTDATA',
    partyId: '00000000-0000-0000-0000-000000000002',
    type: 'PERMIT',
    issued: '2023-01-01',
    validTo: '2023-12-31',
    status: Status.ACTIVE,
    statusReason: 'Test status reason',
    description: 'Test asset description',
    additionalParameters: { key1: 'value1' },
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    assetId: 'TEST-000000002',
    origin: 'TESTDATA',
    partyId: '00000000-0000-0000-0000-000000000005',
    type: 'LICENSE',
    issued: '2023-03-15',
    validTo: '2023-12-31',
    status: Status.ACTIVE,
    statusReason: 'Test status reason',
    description: 'Another test asset description',
    additionalParameters: { key2: 'value2' },
  },
];
