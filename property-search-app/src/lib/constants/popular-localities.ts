// src/lib/constants/popular-localities.ts
export const POPULAR_LOCALITY_KEYS = [
  "electronic_city_phase_2",
  "whitefield",
  "bellandur",
  "marathahalli",
  "hsr_layout",
  "koramangala",
  "sarjapura",
  "nagavara",
  "indiranagar",
  "btm_layout",
  "btm_1st_stage",
  "manyata",
  "mathikere",
  "sanjay_nagar",
] as const;

export const POPULAR_LOCALITY_KEY_SET = new Set<string>(POPULAR_LOCALITY_KEYS);
