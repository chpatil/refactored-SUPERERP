import React from "react"
import { Flex, Heading, VStack, Box } from "@ark-ui/react"
import { AddWorker } from "@/components/Workers/AddWorker"
import { WorkerList } from "@/components/Workers/WorkerList"

export default function WorkersPage() {
  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="xl">
            Workers Management
          </Heading>
          <AddWorker />
        </Flex>
        <WorkerList />
      </VStack>
    </Box>
  )
}