export function makeGettersEnumerable(obj: object): void {
  // Walk the full prototype chain so subclasses also get their inherited getters made enumerable.
  let proto: object | null = Object.getPrototypeOf(obj);
  while (proto !== null && proto !== Object.prototype) {
    // For each getter on this level of the prototype...
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
      if (descriptor.get) {
        // Create a property **on this object directly** that mirrors the one on the prototype, except it's
        // enumerable. It has to be on the object directly for things like Object.keys() to find it. For details,
        // see the MSDN documentation on how this works:
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties#traversing_object_properties
        // This feels silly to me, but it's the only way that actually works.
        Object.defineProperty(obj, key, { ...descriptor, enumerable: true });
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
}
