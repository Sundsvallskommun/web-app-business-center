import { RequestWithUser } from '@/interfaces/auth.interface';

type SignCacheType = keyof RequestWithUser['session']['signs'];

export const handleSignCache = (req: RequestWithUser) => {
  req.session.signs ??= { pending: {}, completed: {}, details: {}, mandates: {} };
  const set = <T = any>(type: SignCacheType, transactionId: string, data: T) => {
    req.session.signs[type] = { ...req.session.signs[type], [transactionId]: data as any };
  };
  const get = <T = unknown>(type: SignCacheType, transactionId: string) => {
    const data = req.session.signs[type]?.[transactionId];
    if (!data) return undefined;
    return data as T;
  };
  const remove = (type: SignCacheType, transactionId: string) => {
    const old = req.session.signs[type];
    if (old?.[transactionId]) {
      delete old?.[transactionId];
    }
    req.session.signs[type] = old ?? {};
  };

  return { set, get, remove };
};
