export function makeGettersEnumerable(obj: Object): void {
  // Get a list of all the properties on this class's constructor.
  const descriptors = Object.getOwnPropertyDescriptors(obj.constructor.prototype);
  // For each property on the constructor...
  for (const [key, descriptor] of Object.entries(descriptors)) {
    // If it's a getter...
    if (descriptor.get) {
      // Create a property **on this object directly** that mirrors the one on the prototype, except it's
      // enumerable. It has to be on the object directly for things like Object.keys() to find it. For details,
      // see the MSDN documentation on how this works:
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties#traversing_object_properties
      // This feels silly to me, but it's the only way that actually works.
      Object.defineProperty(obj, key, {
        ...descriptor,
        enumerable: true,
      });
    }
  }
}
