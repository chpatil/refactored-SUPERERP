import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { type ApiError, type LeaveRequestPublic, LeaveRequestsService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddLeaveRequest from "../../components/LeaveRequests/AddLeaveRequest"
import EditLeaveRequest from "../../components/LeaveRequests/EditLeaveRequest"
import useCustomToast from "../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/leave-requests")({
  component: LeaveRequests,
})

const PER_PAGE = 5

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
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const navigate = useNavigate({ from: "/leave-requests" })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure()

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
      const errDetail = (error as ApiError).body?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    }
  }, [isError, error, showToast])

  return (
    <>
      <Container maxW="full">
        <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
          Leave Requests Management
        </Heading>

        <Navbar type={"LeaveRequest"} addModalAs={AddLeaveRequest} />

        {isPending ? (
          <Flex justify="center" align="center" height="50vh" width="full">
            <Text>Loading...</Text>
          </Flex>
        ) : (
          <TableContainer>
            <Table size={{ base: "sm", md: "md" }}>
              <Thead>
                <Tr>
                  <Th>Leave Type</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                  <Th>Status</Th>
                  <Th>Reason</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              {leaveRequests?.data && (
                <Tbody>
                  {leaveRequests.data.map((leaveRequest) => (
                    <Tr key={leaveRequest.id} opacity={1}>
                      <Td
                        color={!leaveRequest.leave_type ? "ui.dim" : "inherit"}
                        isTruncated
                        maxWidth="150px"
                      >
                        {leaveRequest.leave_type || "N/A"}
                        <Text fontSize="sm" color="ui.dim">
                          ID: {leaveRequest.id.slice(0, 8)}...
                        </Text>
                      </Td>
                      <Td
                        color={!leaveRequest.start_date ? "ui.dim" : "inherit"}
                        isTruncated
                        maxWidth="150px"
                      >
                        {new Date(leaveRequest.start_date).toLocaleDateString()}
                      </Td>
                      <Td
                        color={!leaveRequest.end_date ? "ui.dim" : "inherit"}
                        isTruncated
                        maxWidth="150px"
                      >
                        {new Date(leaveRequest.end_date).toLocaleDateString()}
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(leaveRequest.status)}>
                          {leaveRequest.status}
                        </Badge>
                      </Td>
                      <Td
                        color={!leaveRequest.reason ? "ui.dim" : "inherit"}
                        isTruncated
                        maxWidth="200px"
                      >
                        {leaveRequest.reason || "N/A"}
                      </Td>
                      <Td>
                        <ActionsMenu
                          type={"LeaveRequest"}
                          value={leaveRequest}
                          disabled={false}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              )}
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  )
}

export default LeaveRequests
