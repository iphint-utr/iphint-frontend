import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FontFamilyKey = 'inter' | 'plus-jakarta' | 'roboto';
export type FontSizeKey = 'sm' | 'md' | 'lg' | 'xl';

export const FONT_FAMILY_MAP: Record<FontFamilyKey, string> = {
  inter: 'var(--font-inter)',
  'plus-jakarta': 'var(--font-plus-jakarta)',
  roboto: 'var(--font-roboto)',
};

export const FONT_FAMILY_LABELS: Record<FontFamilyKey, string> = {
  inter: 'Inter',
  'plus-jakarta': 'Plus Jakarta Sans',
  roboto: 'Roboto',
};

export const FONT_SIZE_MAP: Record<FontSizeKey, string> = {
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
};

export const FONT_SIZE_LABELS: Record<FontSizeKey, string> = {
  sm: 'Small (14px)',
  md: 'Default (16px)',
  lg: 'Large (18px)',
  xl: 'X-Large (20px)',
};

interface ThemeState {
  fontFamily: FontFamilyKey;
  fontSize: FontSizeKey;
}

const initialState: ThemeState = {
  fontFamily: 'inter',
  fontSize: 'md',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setFontFamily(state, action: PayloadAction<FontFamilyKey>) {
      state.fontFamily = action.payload;
    },
    setFontSize(state, action: PayloadAction<FontSizeKey>) {
      state.fontSize = action.payload;
    },
  },
});

export const { setFontFamily, setFontSize } = themeSlice.actions;
export default themeSlice.reducer;
