import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Grid,
  GridItem,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"

import { type ApiError, LeaveRequestsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/leave-requests")({
  component: LeaveRequests,
})

function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "green"
    case "rejected":
      return "red"
    case "pending":
      return "yellow"
    default:
      return "gray"
  }
}

function LeaveRequests() {
  const showToast = useCustomToast()

  const {
    data: leaveRequests,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["leave-requests"],
    queryFn: () => LeaveRequestsService.readLeaveRequests({}),
  })

  useEffect(() => {
    if (isError) {
      const errDetail = ((error as ApiError).body as any)?.detail
      showToast.showErrorToast(`${errDetail}`)
    }
  }, [isError, error, showToast])

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Leave Requests Management
      </Heading>

      {isPending ? (
        <Flex justify="center" align="center" height="50vh" width="full">
          <Text>Loading...</Text>
        </Flex>
      ) : (
        <Box>
          {/* Table Header */}
          <Grid templateColumns="repeat(6, 1fr)" gap={2} p={3} bg="bg.muted" borderRadius="md" mb={2}>
            <GridItem>
              <Text fontWeight="bold">Leave Type</Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold">Start Date</Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold">End Date</Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold">Status</Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold">Reason</Text>
            </GridItem>
            <GridItem>
              <Text fontWeight="bold">Actions</Text>
            </GridItem>
          </Grid>
          {/* Table Body */}
          {leaveRequests?.data && leaveRequests.data.map((leaveRequest) => (
            <Grid templateColumns="repeat(6, 1fr)" gap={2} p={3} borderWidth={1} borderRadius="md" mb={2} key={leaveRequest.id}>
              <GridItem>
                <Text truncate maxW="150px">
                  {leaveRequest.leave_type || "N/A"}
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  ID: {leaveRequest.id.slice(0, 8)}...
                </Text>
              </GridItem>
              <GridItem>
                <Text truncate maxW="150px">
                  {leaveRequest.start_date ? new Date(leaveRequest.start_date).toLocaleDateString() : "N/A"}
                </Text>
              </GridItem>
              <GridItem>
                <Text truncate maxW="150px">
                  {leaveRequest.end_date ? new Date(leaveRequest.end_date).toLocaleDateString() : "N/A"}
                </Text>
              </GridItem>
              <GridItem>
                <Badge colorPalette={getStatusColor(leaveRequest.status || "pending")}>
                  {leaveRequest.status || "pending"}
                </Badge>
              </GridItem>
              <GridItem>
                <Text truncate maxW="200px">
                  {leaveRequest.reason || "N/A"}
                </Text>
              </GridItem>
              <GridItem>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </GridItem>
            </Grid>
          ))}
        </Box>
      )}
    </Container>
  )
}

export default LeaveRequests
