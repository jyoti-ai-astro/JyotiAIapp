# Guru RAG Corpus Data & Provenance Standards

This directory contains schema definitions and golden references for the JyotiAI Guru RAG Knowledge Base.

## Standards & Integrity

1. **Provenance Requirement**: All ingested documents must trace to a verified astrological or spiritual tradition (`PARASHARA`, `JAIMINI`, `VARAHAMIHIRA`, `MANTRESWARA`, `KALYANA_VARMA`, `VAIDYANATHA`, `VEDIC_CLASSICAL_GENERAL`, `MODERN_VEDIC`, `SPIRITUAL_HERMENEUTIC`, `PANCHANG_TRADITION`).
2. **Authenticity Tiers**:
   - `TIER_1_CANONICAL_CLASSICAL`: Direct classical shloka citations with book/chapter/verse numbers.
   - `TIER_2_COMMENTARY_HERMENEUTIC`: Verified classical commentaries and scholarly translations.
   - `TIER_3_MODERN_SYNTHESIS`: Peer-reviewed contemporary practitioner research.
   - `TIER_4_HEURISTIC_EXPLORATORY`: Internal exploratory heuristics.
3. **Astrology Truth & Safety**:
   - Corpus documents must never contain fatalistic death predictions, medical diagnoses, or financial guarantees.
   - No fabricated mathematical ephemeris values are stored here; this corpus stores qualitative, textual, and hermeneutic principles.
