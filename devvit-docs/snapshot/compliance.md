# Compliance

You are not permitted to display any deleted or edited Reddit public content or information. This data must be removed. Reddit provides [compliance endpoints via Firehose](https://developers.reddit.com/docs/firehose/api/#tag/Firehose/operation/Firehose_Compliance) so you can routinely receive this information.

In addition, Reddit provides you with two datasets to make it easier for you to display and remove any deleted or edited Reddit public content you’ve received since the last data delivery that include:

- `records_to_remove`, which identifies records included in the previous dataset that have been removed from Reddit
- `records_to_redact`, which identifies records included in the previous dataset that have been edited with the corresponding newest data
