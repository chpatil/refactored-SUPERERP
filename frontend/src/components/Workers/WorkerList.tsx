// filepath: /Users/chinmaypatil/Documents/SuperERP/frontend/src/components/Workers/WorkerList.tsx
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
  Box,
  HStack,
  Text,
  Badge,
  Grid,
  Card,
  Stack,
  Skeleton,
  IconButton,
  Flex,
  Input,
} from "@chakra-ui/react"
import { FaEdit, FaTrash, FaSearch, FaEye } from "react-icons/fa"

import { type WorkerPublic, WorkersService } from "../../client"
import { InputGroup } from "../ui/input-group"
import { EditWorker } from "./EditWorker"
import { DeleteWorker } from "./DeleteWorker"

interface WorkerCardProps {
  worker: WorkerPublic
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker }) => {
  return (
    <Card>
      <Card.Body>
        <Stack gap={3}>
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="lg">{worker.name}</Text>
            {worker.gender && (
              <Badge colorPalette={worker.gender === "Male" ? "blue" : "pink"} variant="subtle">
                {worker.gender}
              </Badge>
            )}
          </HStack>
          
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" fontFamily="mono" color="gray.500">
              ID: {worker.id}
            </Text>
            <HStack>
              <IconButton
                aria-label="View worker details"
                icon={<FaEye />}
                size="sm"
                variant="ghost"
              />
              <EditWorker worker={worker} />
              <DeleteWorker workerId={worker.id} />
            </HStack>
          </Flex>
          
          {worker.department && (
            <Text fontSize="sm" color="gray.600">
              Department: {worker.department}
            </Text>
          )}
        </Stack>
      </Card.Body>
    </Card>
  )
}

export function WorkerList() {
  const [search, setSearch] = useState("")
  
  const { data: workers = [], isLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const response = await WorkersService.listWorkers()
      return response.workers
    },
  })
  
  const filteredWorkers = workers.filter((worker) => {
    const searchLower = search.toLowerCase()
    return (
      !search ||
      worker.name?.toLowerCase().includes(searchLower) ||
      worker.department?.toLowerCase().includes(searchLower) ||
      worker.id?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <Box>
      <InputGroup className="mb-4">
        <InputGroup.LeftElement>
          <FaSearch />
        </InputGroup.LeftElement>
        <Input
          placeholder="Search workers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {isLoading ? (
        <Grid templateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={6}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height="120px" borderRadius="md" />
          ))}
        </Grid>
      ) : filteredWorkers.length > 0 ? (
        <Grid templateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={6}>
          {filteredWorkers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" p={8} bg="gray.50" borderRadius="md">
          <Text color="gray.500">
            {search ? "No workers match your search" : "No workers found"}
          </Text>
        </Box>
      )}
    </Box>
  )
}
