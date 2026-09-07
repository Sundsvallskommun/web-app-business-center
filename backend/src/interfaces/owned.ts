declare const owned: unique symbol;

/**
 * A value that has passed an ownership check for the party the caller represents.
 *
 * Structurally still a `T`, so it can be passed anywhere a `T` is accepted. Only functions that
 * demand `Owned<T>` are constrained, and they cannot be handed a value that skipped the gate.
 */
export type Owned<T> = T & { readonly [owned]: true };

/**
 * Assert that a value belongs to the represented party. Does not check anything, so call it only
 * where the check has just been made. Guarantees the gate ran, not that it was correct.
 *
 * @param value the value the caller has just verified ownership of
 */
export const asOwned = <T>(value: T): Owned<T> => value as Owned<T>;
