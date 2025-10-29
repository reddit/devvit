export function isDevvitDependency(dependencyName: string): boolean {
  // NOTE: This function exists in two places, one in the repo-tools and one in
  // shared-types, in order to prevent cyclic dependency graphs. If you change
  // this function, make sure to update the other one as well!

  // @devvit/kit has an independent release cycle as a fully open-source package
  // We don't care about its version, npm will alert the user if there is a missmatch
  if (dependencyName === '@devvit/kit') {
    return false;
  }
  return dependencyName === 'devvit' || dependencyName.startsWith('@devvit/');
}

export function isDependencyManagedByDevvit(dependencyName: string): boolean {
  // Note: The moment we want to add a second dependency that isn't a @devvit/
  // dependency, we should refactor this function to check against an array of
  // managed dependencies.
  if (dependencyName === 'typescript') {
    return true;
  }
  return isDevvitDependency(dependencyName);
}
