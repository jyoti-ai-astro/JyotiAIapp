# Kundali Engine Foundation

## Current Status

- Current engine id: `internal_approx_v1`
- Accuracy class: `APPROXIMATE`
- Validation status: `UNVALIDATED`
- Swiss Ephemeris usage: `false`

The implementation in this directory uses internal approximate calculations. It must not be represented as Swiss Ephemeris-backed, Lahiri-validated, or production-grade precision.

## Reference Data

`data/reference-dataset.schema.json` defines the schema for future golden/reference validation cases. The repository intentionally does not include authoritative numeric astrology fixtures.

## Compatibility

Astro metadata is additive. Historical Kundali records that do not include the new metadata fields remain valid input for existing readers.
