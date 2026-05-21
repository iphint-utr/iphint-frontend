'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  setFontFamily,
  setFontSize,
  FONT_FAMILY_MAP,
  FONT_SIZE_MAP,
  type FontFamilyKey,
  type FontSizeKey,
} from '@/lib/store/slices/themeSlice';

export default function FontProvider() {
  const dispatch = useAppDispatch();
  const { fontFamily, fontSize } = useAppSelector((state) => state.theme);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const savedFamily = localStorage.getItem('app-font-family') as FontFamilyKey | null;
    const savedSize = localStorage.getItem('app-font-size') as FontSizeKey | null;
    if (savedFamily && savedFamily in FONT_FAMILY_MAP) dispatch(setFontFamily(savedFamily));
    if (savedSize && savedSize in FONT_SIZE_MAP) dispatch(setFontSize(savedSize));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply font family CSS variable whenever it changes
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-family', FONT_FAMILY_MAP[fontFamily]);
    localStorage.setItem('app-font-family', fontFamily);
  }, [fontFamily]);

  // Apply base font size CSS variable whenever it changes
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size-base', FONT_SIZE_MAP[fontSize]);
    localStorage.setItem('app-font-size', fontSize);
  }, [fontSize]);

  return null;
}
