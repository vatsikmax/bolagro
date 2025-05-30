import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { useState } from "react"

const NovaPoshtaForm = ({
  onSelect,
}: {
  onSelect: (town: string, warehouse: string) => void
}) => {
  const [selectedTown, setSelectedTown] = useState<string>("")

  const [townFilter, setTownFilter] = useState<string>("")

  const [towns, setTowns] = useState<string[]>([])

  const [warehouseFilter, setWarehouseFilter] = useState<string>("")

  const [warehouses, setWarehouses] = useState<string[]>([])

  return (
    <div>
      <div>
        <label
          htmlFor="town-select"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Select your town
        </label>
        <input
          type="text"
          id="town-select"
          value={townFilter}
          onChange={(event) => {
            const value = event.target.value
            setTownFilter(value) // Update townFilter to correspond to user input
            sdk.client
              .fetch(`/store/custom/nova-poshta/city?town=${value}`, {
                method: "GET",
              })
              .then((response: any) =>
                setTowns(
                  Array.isArray(response.data.data) ? response.data.data : []
                )
              )
              .catch(medusaError)
          }}
          onClick={() => {
            sdk.client
              .fetch(`/store/custom/nova-poshta/city?town=${townFilter}`, {
                method: "GET",
              })
              .then((response: any) =>
                setTowns(
                  Array.isArray(response.data.data) ? response.data.data : []
                )
              )
              .catch(medusaError)
          }}
          placeholder="Type to search or select a town"
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {towns.length > 0 && (
          <ul className="border border-gray-300 rounded-md shadow-sm max-h-40 overflow-y-auto">
            {towns.map((town: any) => (
              <li
                key={town?.Description}
                onClick={() => {
                  setSelectedTown(town.Description)
                  setTownFilter(town.Description) // Replace townFilter with selectedTown
                  setTowns([]) // Hide the list
                }}
                className="p-2 cursor-pointer hover:bg-gray-100"
              >
                {town.Description}
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedTown.length > 0 && (
        <div>
          <label
            htmlFor="warehouse-select"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Select your warehouse
          </label>
          <input
            type="text"
            id="warehouse-select"
            value={warehouseFilter}
            onChange={(event) => {
              const value = event.target.value
              setWarehouseFilter(value) // Update warehouseFilter to correspond to user input
              sdk.client
                .fetch(
                  `/store/custom/nova-poshta/warehouse?town=${selectedTown}&warehouse=${value}`,
                  {
                    method: "GET",
                  }
                )
                .then((response: any) =>
                  setWarehouses(
                    Array.isArray(response.data.data) ? response.data.data : []
                  )
                )
                .catch(medusaError)
            }}
            onClick={() => {
              sdk.client
                .fetch(
                  `/store/custom/nova-poshta/warehouse?town=${selectedTown}&warehouse=${warehouseFilter}`,
                  {
                    method: "GET",
                  }
                )
                .then((response: any) =>
                  setWarehouses(
                    Array.isArray(response.data.data) ? response.data.data : []
                  )
                )
                .catch(medusaError)
            }}
            placeholder="Type to search or select a warehouse"
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {warehouses.length > 0 && (
            <ul
              className="border border-gray-300 rounded-md shadow-sm max-h-40 overflow
            y-auto"
            >
              {warehouses.map((warehouse: any) => (
                <li
                  key={warehouse?.Description}
                  onClick={() => {
                    onSelect(selectedTown, warehouse.Description) // Call the onSelect function with the selected warehouse
                    setWarehouseFilter(warehouse.Description) // Replace warehouseFilter with selectedWarehouse
                    setWarehouses([]) // Hide the list
                  }}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                >
                  {warehouse.Description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NovaPoshtaForm
