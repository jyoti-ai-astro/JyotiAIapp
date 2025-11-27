# Swiss Ephemeris Data Files

## Required Files

Place the following Swiss Ephemeris data files in this directory:

### Essential Files:
- `SEPL_*.se1` - Planetary ephemeris (main planets)
- `SEMO_*.se1` - Moon ephemeris (for high precision)

### Optional Files:
- `SEAT_*.se1` - Asteroid ephemeris
- `SEAS_*.se1` - Additional asteroids

## Download Instructions

1. Visit: https://www.astro.com/swisseph/swephinfo_e.htm
2. Download the Swiss Ephemeris data files
3. Extract and place `.se1` files in this directory
4. Ensure files are named correctly (e.g., `SEPL_1800_2100.se1`)

## File Naming

Swiss Ephemeris files follow this pattern:
- `SEPL_YYYY_YYYY.se1` - Planetary data for year range
- `SEMO_YYYY_YYYY.se1` - Moon data for year range

## License

Swiss Ephemeris is free for non-commercial use. For commercial use, check licensing requirements at astro.com.

## Verification

Once files are in place, the `swisseph-wrapper.ts` will automatically detect and use them for accurate calculations.

