# Getting started

Reddit communities are data-rich forums where people go to discuss specific topics, events, brands, products, and services. Snapshot provides access to a historical archive of Reddit public content and information, including a collection of accounts, subreddits, posts, comments, and engagement metrics. Data spanning a period of time is delivered as a bulk export rather than a stream or API service. If you are not a Snapshot client, please reach out to your Account Manager for pricing and more information.

# Data delivery

When you first sign up for Snapshot, you’ll select your preferred data format (JSON or CVS) and cloud provider (Google Cloud Storage or Amazon S3).

Data is delivered in a compressed GZIP to its own directory. The directory is named in the `date=YYYY-MM-DD` format, which corresponds to the last date included in the dataset. This folder contains subdirectories for each entity:

- accounts
- comments
- posts
- subreddits

Subsequent deliveries also include additional datasets in these subdirectories for compliance purposes:

- records_to_redact
- records_to_remove

Specific directions for access to the data in Google Cloud or AWS will be provided separately.
For more information on data format, please see the [Schemas](schemas.md) and [Examples](examples.md).
