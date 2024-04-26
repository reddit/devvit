export function makeUniqueIdGenerator(): (id: string) => string {
  const seenActionIds = new Set<string>();
  return (id: string) => {
    let uniqueId = id;
    let counter = 1;
    while (seenActionIds.has(uniqueId)) {
      uniqueId = `${id}.${counter++}`;
    }
    seenActionIds.add(uniqueId);
    return uniqueId;
  };
}
