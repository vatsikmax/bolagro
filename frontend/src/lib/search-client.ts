export const searchClient = {
  search(requests: any) {
    if (!requests || requests.length === 0)
      return Promise.resolve({ results: [] })

    // Extract the search query from requests (string - from search, query - from store)
    const query =
      typeof requests === "string" ? requests : requests[0].params.query
    // Call your custom Medusa search endpoint
    console.log('NEXT_PUBLIC_MEDUSA_BACKEND_URL:', process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)
    return fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/products?q=${query}`,
      {
        headers: {
          "x-publishable-api-key": process.env
            .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Search API response:", data)
        // Transform the response to match Algolia's expected structure
        return {
          results: [
            {
              hits: data.products.map((product: any) => ({
                objectID: product.id,
                handle: product.handle,
                title: product.title,
                description: product.description,
                thumbnail: product.thumbnail,
                price: product.price,
              })),
              nbHits: data.products.length,
            },
          ],
        }
      })
      .catch((error) => {
        console.error("Search API error:", error)
        return { results: [] }
      })
  },
}

export const SEARCH_INDEX_NAME =
  process.env.NEXT_PUBLIC_INDEX_NAME || "dummy-index"
