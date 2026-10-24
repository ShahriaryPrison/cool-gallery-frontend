'use client';

import { useEffect } from 'react';
import { installPersianDigitInputs } from '@/lib/digits';

export function PersianDigitInputs() {
  useEffect(() => installPersianDigitInputs(), []);
  return null;
}
