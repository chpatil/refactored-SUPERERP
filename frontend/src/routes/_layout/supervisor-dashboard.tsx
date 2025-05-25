import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

import { ReportsService, TeamsService, AttendanceService } from "../../client"
import useAuth from "../../hooks/useAuth"

export const Route = createFileRoute("/_layout/supervisor-dashboard")({
  component: SupervisorDashboard,
})

function SupervisorDashboard() {
  const { user } = useAuth()
  const cardBg = useColorModeValue("white", "gray.800")

  // Get dashboard statistics
  const { data: dashboardStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => ReportsService.getDashboardStatistics(),
  })

  // Get team members
  const { data: teamMembers } = useQuery({
    queryKey: ["my-team"],
    queryFn: () => TeamsService.getMyTeam(),
  })

  // Get today's team attendance
  const { data: todayAttendance } = useQuery({
    queryKey: ["today-team-attendance"],
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0]
      return AttendanceService.readAttendanceRecords({
        startDate: today,
        endDate: today,
      })
    },
  })

  return (
    <Container maxW="full" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Supervisor Dashboard</Heading>

        {/* Key Statistics */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Team Members</StatLabel>
                <StatNumber>{dashboardStats?.team_members || 0}</StatNumber>
                <StatHelpText>Active team size</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Today's Attendance</StatLabel>
                <StatNumber>{dashboardStats?.today_team_attendance || 0}</StatNumber>
                <StatHelpText>Present today</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Attendance Rate</StatLabel>
                <StatNumber>{dashboardStats?.team_attendance_rate || 0}%</StatNumber>
                <StatHelpText>Today's rate</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Pending Approvals</StatLabel>
                <StatNumber>{dashboardStats?.pending_leave_approvals || 0}</StatNumber>
                <StatHelpText>Leave requests</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Card bg={cardBg}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Quick Actions</Heading>
              <HStack spacing={4} wrap="wrap">
                <Button as={Link} to="/leave-requests" colorScheme="blue">
                  Review Leave Requests
                </Button>
                <Button as={Link} to="/attendance" colorScheme="green">
                  View Team Attendance
                </Button>
                <Button as={Link} to="/reports" colorScheme="purple">
                  Generate Reports
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Team Members Overview */}
        <Card bg={cardBg}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="md">Team Members</Heading>
                <Button as={Link} to="/teams" size="sm" variant="outline">
                  Manage Team
                </Button>
              </Flex>

              {teamMembers && teamMembers.length > 0 ? (
                <TableContainer>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Employee ID</Th>
                        <Th>Team</Th>
                        <Th>Today's Status</Th>
                        <Th>Department</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {teamMembers.slice(0, 10).map((member: any) => {
                        const todayRecord = todayAttendance?.data?.find(
                          (record: any) => record.employee_id === member.laborer.id
                        )
                        
                        return (
                          <Tr key={member.laborer.id}>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium">
                                  {member.laborer.full_name}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  {member.laborer.email}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>{member.laborer.employee_id}</Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm">{member.team_name}</Text>
                                <Text fontSize="xs" color="gray.500">
                                  {member.site_location}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              {todayRecord ? (
                                todayRecord.check_out ? (
                                  <Badge colorScheme="blue">Completed</Badge>
                                ) : (
                                  <Badge colorScheme="green">Present</Badge>
                                )
                              ) : (
                                <Badge colorScheme="red">Absent</Badge>
                              )}
                            </Td>
                            <Td>{member.laborer.department}</Td>
                          </Tr>
                        )
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Text color="gray.500" textAlign="center" py={8}>
                  No team members assigned yet
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card bg={cardBg}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Today's Attendance Summary</Heading>
              
              {todayAttendance?.data && todayAttendance.data.length > 0 ? (
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                  <Box p={4} borderRadius="md" bg="green.50" borderColor="green.200" borderWidth={1}>
                    <Text fontSize="sm" color="green.600" fontWeight="medium">
                      Present
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.700">
                      {todayAttendance.data.length}
                    </Text>
                  </Box>
                  
                  <Box p={4} borderRadius="md" bg="blue.50" borderColor="blue.200" borderWidth={1}>
                    <Text fontSize="sm" color="blue.600" fontWeight="medium">
                      Checked Out
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                      {todayAttendance.data.filter((record: any) => record.check_out).length}
                    </Text>
                  </Box>
                  
                  <Box p={4} borderRadius="md" bg="yellow.50" borderColor="yellow.200" borderWidth={1}>
                    <Text fontSize="sm" color="yellow.600" fontWeight="medium">
                      Still Working
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="yellow.700">
                      {todayAttendance.data.filter((record: any) => !record.check_out).length}
                    </Text>
                  </Box>
                </Grid>
              ) : (
                <Text color="gray.500" textAlign="center" py={4}>
                  No attendance records for today
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default SupervisorDashboard
