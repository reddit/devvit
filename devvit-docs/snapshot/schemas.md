# Schemas

## Format

Data is delivered in CSV or JSON format.

### CSV

Most values are unquoted, except:

- Post bodies
- Comment bodies
- Comma-delimited gallery image URL lists

`Null` values appear as empty

### JSON

Most values are double-quoted, including numbers (integers), except:

- Booleans
- Decimals

`Null` values are omitted; their labels are not present.
Empty gallery image URL lists are included as empty arrays: []

## Fields

### Accounts

Error processing schema for "accounts".

### Subreddits

Error processing schema for "subreddits".

### Posts

Error processing schema for "posts".

### Comments

Error processing schema for "comments".

### Records_to_remove

Error processing schema for "records_to_remove".

### Records_to_redact

Error processing schema for "records_to_redact".
