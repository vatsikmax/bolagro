import { Container, Text } from "@medusajs/ui"
import { useHits, useSearchBox } from "react-instantsearch-hooks-web"

import InteractiveLink from "@modules/common/components/interactive-link"

const ShowAll = ({ dict }: { dict: any }) => {
  const { hits } = useHits()
  const { query } = useSearchBox()
  const width = typeof window !== "undefined" ? window.innerWidth : 0

  if (query === "") return null
  if (hits.length > 0 && hits.length <= 6) return null

  if (hits.length === 0) {
    return (
      <Container
        className="flex gap-2 justify-center h-fit py-2"
        qt-data-id="no-search-results-container"
      >
        <Text>{dict.ShowAll.noResultsFound}</Text>
      </Container>
    )
  }

  return (
    <Container className="flex sm:flex-col small:flex-row gap-2 justify-center items-center h-fit py-4 small:py-2">
      <Text>
        {dict.ShowAll.showingTheFirst} {width > 640 ? 6 : 3}{" "}
        {dict.ShowAll.results}
      </Text>
      <InteractiveLink href={`/results/${query}`}>
        {dict.ShowAll.viewAll}
      </InteractiveLink>
    </Container>
  )
}

export default ShowAll
