# Swiss Ephemeris Integration

## Setup Instructions

### 1. Download Ephemeris Data Files

Swiss Ephemeris requires data files for accurate calculations. Download from:
https://www.astro.com/swisseph/swephinfo_e.htm

### 2. Required Files

Place these files in `/lib/engines/kundali/data/`:

- `SEPL_*.se1` - Planetary ephemeris (main planets)
- `SEAT_*.se1` - Asteroid ephemeris (optional)
- `SEMO_*.se1` - Moon ephemeris (for high precision)

### 3. File Structure

```
/lib/engines/kundali/
  ├── data/
  │   ├── SEPL_*.se1
  │   ├── SEAT_*.se1
  │   └── SEMO_*.se1
  ├── swisseph-wrapper.ts
  └── generator.ts
```

### 4. Update Implementation

Once files are in place, update `swisseph-wrapper.ts` to use actual Swiss Ephemeris library:

```typescript
const swisseph = require('swisseph')
// Initialize with data file path
swisseph.swe_set_ephe_path('./lib/engines/kundali/data')
```

### 5. Current Status

- ✅ Base layer structure implemented
- ✅ Interface defined
- ✅ Rashi/Nakshatra conversion functions ready
- ⏳ Awaiting ephemeris data files for actual calculations

## License Note

Swiss Ephemeris is free for non-commercial use. For commercial use, check licensing requirements.

