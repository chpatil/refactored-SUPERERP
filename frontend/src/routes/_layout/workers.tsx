import { createFileRoute } from '@tanstack/react-router'
import { Container, Flex, Heading, Stack } from '@chakra-ui/react'
// Import named exports directly
import { AddWorker } from '../../components/Workers/AddWorker.tsx'
import { WorkerList } from '../../components/Workers/WorkerList.tsx'

function Workers() {
  return (
    <Container maxW="full" py={8}>
      <Stack gap={6}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="2xl" color="blue.600">
            Workers Management
          </Heading>
          <AddWorker />
        </Flex>
        <WorkerList />
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_layout/workers')({
  component: Workers,
})