import type { Metadata } from '@devvit/protos';

import type { JSONObject } from '../../../types/json.js';
import type { T2ID } from '../../../types/tid.js';
import { asT2ID } from '../../../types/tid.js';
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
  userId: T2ID;

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

export async function getVaultByAddress(
  address: string,
  metadata: Metadata | undefined
): Promise<Vault> {
  return getVaultByParams(
    'GetVaultContactByAddress',
    '3e2f7966a5c120e64fd2795d06a46595c52d988185be98d3ed71c3f81ae80d2e',
    {
      provider: 'ethereum', // Only one supported at the moment
      address,
    },
    metadata
  );
}

export async function getVaultByUserId(
  userId: T2ID,
  metadata: Metadata | undefined
): Promise<Vault> {
  return getVaultByParams(
    'GetVaultContactByUserId',
    'a854ddc19d0e22c4f36ed917fdbd568f299f3571427e393aee5e2972080fffe9',
    {
      provider: 'ethereum', // Only one supported at the moment
      userId,
    },
    metadata
  );
}

async function getVaultByParams(
  operationName: string,
  queryHash: string,
  params: JSONObject,
  metadata: Metadata | undefined
): Promise<Vault> {
  // Legacy GQL query. Do not copy this pattern.
  // eslint-disable-next-line no-restricted-properties
  const response = await GraphQL.query(operationName, queryHash, params, metadata);
  const contact = response?.data?.vault?.contact;

  const vault: Vault = {
    provider: contact?.provider,
    userId: asT2ID(contact?.userId),
    address: contact?.address,
    createdAt: contact?.createdAt,
    isActive: contact?.isActive,
  };
  return vault;
}
