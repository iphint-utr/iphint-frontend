import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store' // adjust path to your store
import type { BillingCycle, PlanId, Locale } from '../../../app/[locale]/pricing/pricing'

// ─── State ─────────────────────────────────────────────────────────────────
export interface PricingState {
  locale: Locale
  billingCycle: BillingCycle
  selectedPlan: PlanId | null
  expandedFaqIndex: number | null
  highlightedFeature: string | null
  ctaLoading: PlanId | null
}

const initialState: PricingState = {
  locale: 'en',
  billingCycle: 'monthly',
  selectedPlan: null,
  expandedFaqIndex: null,
  highlightedFeature: null,
  ctaLoading: null,
}

// ─── Slice ─────────────────────────────────────────────────────────────────
export const pricingSlice = createSlice({
  name: 'pricing',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload
    },

    setBillingCycle(state, action: PayloadAction<BillingCycle>) {
      state.billingCycle = action.payload
    },

    toggleBillingCycle(state) {
      state.billingCycle =
        state.billingCycle === 'monthly' ? 'annual' : 'monthly'
    },

    selectPlan(state, action: PayloadAction<PlanId>) {
      state.selectedPlan = action.payload
    },

    clearSelectedPlan(state) {
      state.selectedPlan = null
    },

    toggleFaq(state, action: PayloadAction<number>) {
      state.expandedFaqIndex =
        state.expandedFaqIndex === action.payload ? null : action.payload
    },

    closeFaq(state) {
      state.expandedFaqIndex = null
    },

    setHighlightedFeature(state, action: PayloadAction<string | null>) {
      state.highlightedFeature = action.payload
    },

    setCtaLoading(state, action: PayloadAction<PlanId | null>) {
      state.ctaLoading = action.payload
    },

    resetPricingState() {
      return initialState
    },
  },
})

// ─── Actions ───────────────────────────────────────────────────────────────
export const {
  setLocale,
  setBillingCycle,
  toggleBillingCycle,
  selectPlan,
  clearSelectedPlan,
  toggleFaq,
  closeFaq,
  setHighlightedFeature,
  setCtaLoading,
  resetPricingState,
} = pricingSlice.actions

// ─── Selectors ─────────────────────────────────────────────────────────────
export const selectPricingLocale      = (state: RootState) => state.pricing.locale
export const selectBillingCycle       = (state: RootState) => state.pricing.billingCycle
export const selectSelectedPlan       = (state: RootState) => state.pricing.selectedPlan
export const selectExpandedFaqIndex   = (state: RootState) => state.pricing.expandedFaqIndex
export const selectHighlightedFeature = (state: RootState) => state.pricing.highlightedFeature
export const selectCtaLoading         = (state: RootState) => state.pricing.ctaLoading
export const selectIsAnnual           = (state: RootState) => state.pricing.billingCycle === 'annual'

export default pricingSlice.reducer
