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
  HStack,
  VStack,
  Card,
  CardBody,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"

import { type ApiError, AttendanceService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import useAuth from "../../hooks/useAuth"

export const Route = createFileRoute("/_layout/attendance")({
  component: Attendance,
})

function Attendance() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const showToast = useCustomToast()

  const {
    data: attendanceRecords,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => AttendanceService.readAttendanceRecords({}),
  })

  const {
    data: todayAttendance,
    isPending: todayPending,
  } = useQuery({
    queryKey: ["today-attendance"],
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0]
      return AttendanceService.readAttendanceRecords({
        startDate: today,
        endDate: today,
      })
    },
  })

  const checkInMutation = useMutation({
    mutationFn: () =>
      AttendanceService.createAttendanceRecord({
        requestBody: {
          check_in: new Date().toISOString(),
          location: "Office", // You can make this dynamic
          notes: "",
        },
      }),
    onSuccess: () => {
      showToast("Success!", "Checked in successfully.", "success")
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      queryClient.invalidateQueries({ queryKey: ["today-attendance"] })
    },
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail
      showToast("Error", `${errDetail}`, "error")
    },
  })

  const checkOutMutation = useMutation({
    mutationFn: (attendanceId: string) =>
      AttendanceService.checkOut({ id: attendanceId }),
    onSuccess: () => {
      showToast("Success!", "Checked out successfully.", "success")
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      queryClient.invalidateQueries({ queryKey: ["today-attendance"] })
    },
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail
      showToast("Error", `${errDetail}`, "error")
    },
  })

  useEffect(() => {
    if (isError) {
      const errDetail = (error as ApiError).body?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    }
  }, [isError, error, showToast])

  const todayRecord = todayAttendance?.data?.[0]
  const isCheckedIn = !!todayRecord
  const isCheckedOut = todayRecord?.check_out

  const calculateHours = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return "In Progress"
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return `${hours.toFixed(2)} hours`
  }

  const getStatusBadge = (record: any) => {
    if (!record.check_out) {
      return <Badge colorScheme="green">Active</Badge>
    }
    return <Badge colorScheme="blue">Completed</Badge>
  }

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Attendance Management
      </Heading>

      {/* Quick Actions Card */}
      <Card mt={6} mb={6}>
        <CardBody>
          <VStack spacing={4}>
            <Heading size="md">Today's Attendance</Heading>
            
            {todayPending ? (
              <Text>Loading...</Text>
            ) : (
              <HStack spacing={4}>
                {!isCheckedIn ? (
                  <Button
                    colorScheme="green"
                    size="lg"
                    onClick={() => checkInMutation.mutate()}
                    isLoading={checkInMutation.isPending}
                  >
                    Check In
                  </Button>
                ) : !isCheckedOut ? (
                  <VStack spacing={2}>
                    <Text color="green.500" fontWeight="bold">
                      Checked in at {new Date(todayRecord.check_in).toLocaleTimeString()}
                    </Text>
                    <Button
                      colorScheme="red"
                      onClick={() => checkOutMutation.mutate(todayRecord.id)}
                      isLoading={checkOutMutation.isPending}
                    >
                      Check Out
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={2}>
                    <Text color="blue.500" fontWeight="bold">
                      Completed for today
                    </Text>
                    <Text fontSize="sm">
                      {calculateHours(todayRecord.check_in, todayRecord.check_out)}
                    </Text>
                  </VStack>
                )}
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Attendance History */}
      <Box>
        <Heading size="md" mb={4}>
          Attendance History
        </Heading>

        {isPending ? (
          <Flex justify="center" align="center" height="50vh" width="full">
            <Text>Loading...</Text>
          </Flex>
        ) : (
          <TableContainer>
            <Table size={{ base: "sm", md: "md" }}>
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Check In</Th>
                  <Th>Check Out</Th>
                  <Th>Duration</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              {attendanceRecords?.data && (
                <Tbody>
                  {attendanceRecords.data.map((record) => (
                    <Tr key={record.id}>
                      <Td>{new Date(record.date).toLocaleDateString()}</Td>
                      <Td>{new Date(record.check_in).toLocaleTimeString()}</Td>
                      <Td>
                        {record.check_out
                          ? new Date(record.check_out).toLocaleTimeString()
                          : "-"}
                      </Td>
                      <Td>{calculateHours(record.check_in, record.check_out)}</Td>
                      <Td>{record.location || "-"}</Td>
                      <Td>{getStatusBadge(record)}</Td>
                      <Td>
                        <Text isTruncated maxW="200px">
                          {record.notes || "-"}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              )}
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  )
}

export default Attendance
