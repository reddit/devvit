export type Namespace = {
  /**
   * Nonnullish address when bound. Set when bound but may be set sooner. May
   * not be unset when unbound.
   *
   * Hostnames are not necessarily unique. Clients always have the same hostname
   * as their EnvelopeDispatcher. Stream IDs are used to distinguish duplicate
   * hostnames.
   */
  hostname: string | undefined;
};
