export type Or<A, B> = A extends true ? true : B extends true ? true : false;
