import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  Grid,
  GridItem,
} from "@chakra-ui/react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"

import { type ApiError, AttendanceService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/attendance")({
  component: Attendance,
})

function Attendance() {
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
      showToast.showSuccessToast("Checked in successfully.")
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      queryClient.invalidateQueries({ queryKey: ["today-attendance"] })
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast.showErrorToast(`${errDetail}`)
    },
  })

  const checkOutMutation = useMutation({
    mutationFn: (attendanceId: string) =>
      AttendanceService.checkOut({ id: attendanceId }),
    onSuccess: () => {
      showToast.showSuccessToast("Checked out successfully.")
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      queryClient.invalidateQueries({ queryKey: ["today-attendance"] })
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast.showErrorToast(`${errDetail}`)
    },
  })

  useEffect(() => {
    if (isError) {
      const errDetail = ((error as ApiError).body as any)?.detail
      showToast.showErrorToast(`${errDetail}`)
    }
  }, [isError, error, showToast])

  const todayRecord = todayAttendance?.data?.[0]
  const isCheckedIn = !!todayRecord
  const isCheckedOut = todayRecord?.check_out

  const calculateHours = (checkIn: string, checkOut?: string | null) => {
    if (!checkOut) return "In Progress"
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return `${hours.toFixed(2)} hours`
  }

  const getStatusBadge = (record: any) => {
    if (!record.check_out) {
      return <Badge colorPalette="green">Active</Badge>
    }
    return <Badge colorPalette="blue">Completed</Badge>
  }

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Attendance Management
      </Heading>

      {/* Quick Actions Card */}
      <Box mt={6} mb={6} p={6} borderWidth={1} borderRadius="md" bg="bg.surface">
        <VStack gap={4}>
          <Heading size="md">Today's Attendance</Heading>
          
          {todayPending ? (
            <Text>Loading...</Text>
          ) : (
            <HStack gap={4}>
              {!isCheckedIn ? (
                <Button
                  colorPalette="green"
                  size="lg"
                  onClick={() => checkInMutation.mutate()}
                  loading={checkInMutation.isPending}
                >
                  Check In
                </Button>
              ) : !isCheckedOut ? (
                <VStack gap={2}>
                  <Text color="green.500" fontWeight="bold">
                    Checked in at {new Date(todayRecord.check_in).toLocaleTimeString()}
                  </Text>
                  <Button
                    colorPalette="red"
                    onClick={() => checkOutMutation.mutate(todayRecord.id)}
                    loading={checkOutMutation.isPending}
                  >
                    Check Out
                  </Button>
                </VStack>
              ) : (
                <VStack gap={2}>
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
      </Box>

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
          <Box>
            {/* Table Header */}
            <Grid templateColumns="repeat(7, 1fr)" gap={2} p={3} bg="bg.muted" borderRadius="md" mb={2}>
              <GridItem>
                <Text fontWeight="bold">Date</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Check In</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Check Out</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Duration</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Location</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Status</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Notes</Text>
              </GridItem>
            </Grid>
            {/* Table Body */}
            {attendanceRecords?.data && attendanceRecords.data.map((record) => (
              <Grid templateColumns="repeat(7, 1fr)" gap={2} p={3} borderWidth={1} borderRadius="md" mb={2} key={record.id}>
                <GridItem>
                  <Text>{new Date(record.date).toLocaleDateString()}</Text>
                </GridItem>
                <GridItem>
                  <Text>{new Date(record.check_in).toLocaleTimeString()}</Text>
                </GridItem>
                <GridItem>
                  <Text>
                    {record.check_out
                      ? new Date(record.check_out).toLocaleTimeString()
                      : "-"}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text>{calculateHours(record.check_in, record.check_out)}</Text>
                </GridItem>
                <GridItem>
                  <Text>{record.location || "-"}</Text>
                </GridItem>
                <GridItem>
                  {getStatusBadge(record)}
                </GridItem>
                <GridItem>
                  <Text truncate maxW="200px">
                    {record.notes || "-"}
                  </Text>
                </GridItem>
              </Grid>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default Attendance
