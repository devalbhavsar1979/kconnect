import apiClient from './client'
import type { ListingFilters, PaginatedOpportunityListings, OpportunityListingCard } from '@/types/opportunity'

type ListParams = Partial<Omit<ListingFilters, 'page'>> & { page?: number; size?: number }

export const opportunityListingApi = {
  list: (params: ListParams = {}): Promise<PaginatedOpportunityListings> => {
    // Strip empty strings so the backend ignores unset filters
    const clean: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(params)) {
      if (v !== '' && v !== null && v !== undefined) clean[k] = v
    }
    return apiClient.get('/opportunities', { params: clean }).then(r => r.data)
  },

  get: (id: string): Promise<OpportunityListingCard> =>
    apiClient.get(`/opportunities/${id}`).then(r => r.data),
}
