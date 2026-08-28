export type AppAuthorizationRole = 'owner' | 'maintainer' | 'unauthorized';
export type AppWriteAction = 'upload' | 'publish' | 'playtest';

export type DeveloperIdentity = Readonly<{
  id?: string;
  displayName?: string;
}>;

type AppAuthorizationData = Readonly<{
  owner?: DeveloperIdentity;
  maintainers: readonly DeveloperIdentity[];
  currentUserRole?: AppAuthorizationRole;
}>;

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | undefined {
  return typeof value === 'object' && value !== null ? (value as UnknownRecord) : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readIdentity(value: unknown): DeveloperIdentity | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  const identity = {
    id: readString(record.id),
    displayName: readString(record.displayName),
  } satisfies DeveloperIdentity;

  return identity.id || identity.displayName ? identity : undefined;
}

function readIdentities(value: unknown): readonly DeveloperIdentity[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(readIdentity)
    .filter((identity): identity is DeveloperIdentity => identity !== undefined);
}

function readAuthorizationRole(value: unknown): AppAuthorizationRole | undefined {
  return value === 'owner' || value === 'maintainer' || value === 'unauthorized'
    ? value
    : undefined;
}

/**
 * Compatibility boundary for authorization metadata returned by the app API.
 *
 * The generated FullAppInfo type does not yet expose maintainer authorization.
 * This parser accepts unknown input and supports both a future
 * app.authorization payload and the prototype app.maintainers field. Replace
 * this parser with the generated type once the backend/protobuf contract lands.
 */
function readAppAuthorizationData(appInfo: unknown): AppAuthorizationData {
  const app = asRecord(asRecord(appInfo)?.app);
  if (!app) return { maintainers: [] };

  const authorization = asRecord(app.authorization);
  const typedMaintainers = readIdentities(authorization?.maintainers);

  return {
    owner: readIdentity(app.owner),
    maintainers: typedMaintainers.length > 0 ? typedMaintainers : readIdentities(app.maintainers),
    currentUserRole: readAuthorizationRole(
      authorization?.currentUserRole ?? app.currentUserRole
    ),
  };
}

function normalizeId(id: string | undefined): string | undefined {
  const normalized = id?.trim();
  return normalized || undefined;
}

function normalizeDisplayName(displayName: string | undefined): string | undefined {
  const normalized = displayName?.trim().toLowerCase();
  return normalized || undefined;
}

function isSameDeveloper(
  candidate: DeveloperIdentity | undefined,
  currentUser: DeveloperIdentity
): boolean {
  if (!candidate) return false;

  const candidateId = normalizeId(candidate.id);
  const currentUserId = normalizeId(currentUser.id);
  if (candidateId && currentUserId) {
    return candidateId === currentUserId;
  }

  const candidateDisplayName = normalizeDisplayName(candidate.displayName);
  const currentUserDisplayName = normalizeDisplayName(currentUser.displayName);
  return !!candidateDisplayName && candidateDisplayName === currentUserDisplayName;
}

export function getAppAuthorizationRole(
  appInfo: unknown,
  currentUser: string | DeveloperIdentity
): AppAuthorizationRole {
  const authorization = readAppAuthorizationData(appInfo);

  // Prefer a backend-computed role when available. The server must remain the
  // authoritative enforcement boundary for all app-version write operations.
  if (authorization.currentUserRole) {
    return authorization.currentUserRole;
  }

  const currentUserIdentity: DeveloperIdentity =
    typeof currentUser === 'string' ? { displayName: currentUser } : currentUser;

  if (isSameDeveloper(authorization.owner, currentUserIdentity)) {
    return 'owner';
  }

  if (
    authorization.maintainers.some((maintainer) =>
      isSameDeveloper(maintainer, currentUserIdentity)
    )
  ) {
    return 'maintainer';
  }

  return 'unauthorized';
}

export function canWriteAppVersion(role: AppAuthorizationRole): boolean {
  return role === 'owner' || role === 'maintainer';
}

export function getAppAuthorizationErrorMessage(
  appInfo: unknown,
  appName: string,
  action: AppWriteAction
): string {
  const ownerDisplayName = readAppAuthorizationData(appInfo).owner?.displayName ?? '<unknown>';

  return `You are not authorized to ${action} the app "${appName}". Please check that you are logged in as the owner (${ownerDisplayName}) or as a designated maintainer.`;
}
