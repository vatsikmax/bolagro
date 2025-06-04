"use server"

import { searchClient } from "@lib/search-client"

interface Hits {
  readonly objectID?: string
  id?: string
  [x: string | number | symbol]: unknown
}

/**
 * @param {string} query - search query
 */
export async function search(query: string) {
  const { hits } = (await searchClient.search(query)).results[0] as {
    hits: Hits[]
  }

  return hits
}
