import type { JsonObject } from '@devvit/shared';
import { T2 } from '@devvit/shared-types/tid.js';

import { GraphQL } from '../graphql/GraphQL.js';

/**
 * A type representing a Vault (crypto wallet).
 */
export type Vault = {
  /**
   * The provider of the Vault address.
   * @example 'ethereum'
   */
  provider: string;

  /**
   * The ID (starting with t2_) of the user owning the Vault.
   * @example 't2_1w72'
   */
  userId: T2;

  /**
   * The address of the Vault.
   * @example '0x205ee28744456bDBf180A0Fa7De51e0F116d54Ed'
   */
  address: string;

  /**
   * The date the Vault was created.
   */
  createdAt: string;

  /**
   * Whether the Vault is active.
   */
  isActive: boolean;
};

export async function getVaultByAddress(address: string): Promise<Vault> {
  return getVaultByParams(
    'GetVaultContactByAddress',
    '3e2f7966a5c120e64fd2795d06a46595c52d988185be98d3ed71c3f81ae80d2e',
    {
      provider: 'ethereum', // Only one supported at the moment
      address,
    }
  );
}

export async function getVaultByUserId(userId: T2): Promise<Vault> {
  return getVaultByParams(
    'GetVaultContactByUserId',
    'a854ddc19d0e22c4f36ed917fdbd568f299f3571427e393aee5e2972080fffe9',
    {
      provider: 'ethereum', // Only one supported at the moment
      userId,
    }
  );
}

async function getVaultByParams(
  operationName: string,
  queryHash: string,
  params: JsonObject
): Promise<Vault> {
  const response = await GraphQL.query(operationName, queryHash, params);
  const contact = response?.data?.vault?.contact;

  return {
    provider: contact?.provider,
    userId: T2(contact?.userId),
    address: contact?.address,
    createdAt: contact?.createdAt,
    isActive: contact?.isActive,
  };
}
