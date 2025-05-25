import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

import { ReportsService, TeamsService, AttendanceService } from "../../client"

export const Route = createFileRoute("/_layout/supervisor-dashboard")({
  component: SupervisorDashboard,
})

function SupervisorDashboard() {
  const {
    data: dashboardStats = {},
  } = useQuery({
    queryKey: ["supervisor-dashboard-stats"],
    queryFn: () => ReportsService.getAttendanceSummary({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    }),
  })

  const {
    data: teamMembers = {},
    isLoading: teamLoading,
  } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => TeamsService.getMyTeam(),
  })

  const {
    data: todayAttendance = {},
    isLoading: attendanceLoading,
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

  return (
    <Container maxW="8xl" p={6}>
      <VStack gap={8} alignItems="stretch">
        <Heading size="lg">Supervisor Dashboard</Heading>

        {/* Key Statistics */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Box p={6} borderWidth={1} borderRadius="lg" bg="white">
            <VStack gap={2} alignItems="center">
              <Text fontSize="sm" color="gray.600">Team Members</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {(dashboardStats as any)?.summary?.unique_employees || 0}
              </Text>
              <Text fontSize="xs" color="gray.500">Active team size</Text>
            </VStack>
          </Box>

          <Box p={6} borderWidth={1} borderRadius="lg" bg="white">
            <VStack gap={2} alignItems="center">
              <Text fontSize="sm" color="gray.600">Today's Attendance</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {(todayAttendance as any)?.data?.length || 0}
              </Text>
              <Text fontSize="xs" color="gray.500">Present today</Text>
            </VStack>
          </Box>

          <Box p={6} borderWidth={1} borderRadius="lg" bg="white">
            <VStack gap={2} alignItems="center">
              <Text fontSize="sm" color="gray.600">Attendance Rate</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {(dashboardStats as any)?.summary?.average_daily_attendance || 0}%
              </Text>
              <Text fontSize="xs" color="gray.500">Today's rate</Text>
            </VStack>
          </Box>

          <Box p={6} borderWidth={1} borderRadius="lg" bg="white">
            <VStack gap={2} alignItems="center">
              <Text fontSize="sm" color="gray.600">Pending Approvals</Text>
              <Text fontSize="2xl" fontWeight="bold">0</Text>
              <Text fontSize="xs" color="gray.500">Leave requests</Text>
            </VStack>
          </Box>
        </Grid>

        {/* Quick Actions */}
        <Box p={6} borderWidth={1} borderRadius="lg" bg="white">
          <VStack gap={4} alignItems="stretch">
            <Heading size="md">Quick Actions</Heading>
            
            <HStack gap={4} flexWrap="wrap">
              <Button variant="solid" colorPalette="blue">
                <Link to="/leave-requests">Review Leave Requests</Link>
              </Button>
              <Button variant="solid" colorPalette="green">
                <Link to="/attendance">View Attendance</Link>
              </Button>
              <Button variant="solid" colorPalette="purple">
                <Link to="/reports">Generate Reports</Link>
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Team Members Overview */}
        <Box p={6} borderWidth={1} borderRadius="lg" bg="white">
          <VStack gap={4} alignItems="stretch">
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="md">Team Members</Heading>
              <Button size="sm" variant="outline">
                <Link to="/teams">Manage Team</Link>
              </Button>
            </HStack>

            {teamLoading ? (
              <Text>Loading team members...</Text>
            ) : (
              <Grid templateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={2}>
                <Text fontWeight="bold" borderBottomWidth={1} p={2}>Name</Text>
                <Text fontWeight="bold" borderBottomWidth={1} p={2}>Employee ID</Text>
                <Text fontWeight="bold" borderBottomWidth={1} p={2}>Site Location</Text>
                <Text fontWeight="bold" borderBottomWidth={1} p={2}>Role</Text>
                <Text fontWeight="bold" borderBottomWidth={1} p={2}>Today's Status</Text>
                
                {((teamMembers as any)?.data || []).map((team: any) => 
                  (team.members || []).map((member: any) => {
                    const todayRecord = (todayAttendance as any)?.data?.find(
                      (record: any) => record.employee_id === member.laborer.id
                    )
                    return (
                      <>
                        <VStack key={`name-${member.laborer.id}`} alignItems="start" gap={0} p={2} borderBottomWidth={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {member.laborer.full_name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {member.site_location}
                          </Text>
                        </VStack>
                        
                        <Text key={`emp-${member.laborer.id}`} p={2} borderBottomWidth={1}>
                          {member.laborer.employee_number}
                        </Text>
                        
                        <Text key={`site-${member.laborer.id}`} p={2} borderBottomWidth={1}>
                          {member.site_location}
                        </Text>
                        
                        <Text key={`role-${member.laborer.id}`} p={2} borderBottomWidth={1}>
                          {member.role || 'Worker'}
                        </Text>
                        
                        <Box key={`status-${member.laborer.id}`} p={2} borderBottomWidth={1}>
                          {todayRecord ? (
                            todayRecord.check_out ? (
                              <Badge variant="solid" colorPalette="blue">Checked Out</Badge>
                            ) : (
                              <Badge variant="solid" colorPalette="green">Present</Badge>
                            )
                          ) : (
                            <Badge variant="solid" colorPalette="red">Absent</Badge>
                          )}
                        </Box>
                      </>
                    )
                  })
                )}
              </Grid>
            )}

            {((teamMembers as any)?.data || []).length === 0 && !teamLoading && (
              <Box p={4} borderRadius="md" bg="yellow.50" borderColor="yellow.200" borderWidth={1}>
                <Text fontSize="sm" color="yellow.600" fontWeight="medium">
                  No team members found. Start by adding team members to see their status here.
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Recent Activities */}
        <Box p={6} borderWidth={1} borderRadius="lg" bg="white">
          <VStack gap={4} alignItems="stretch">
            <Heading size="md">Recent Activities</Heading>
            
            <Grid templateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={2}>
              <Text fontWeight="bold" borderBottomWidth={1} p={2}>Time</Text>
              <Text fontWeight="bold" borderBottomWidth={1} p={2}>Employee</Text>
              <Text fontWeight="bold" borderBottomWidth={1} p={2}>Action</Text>
              <Text fontWeight="bold" borderBottomWidth={1} p={2}>Location</Text>
              
              {((todayAttendance as any)?.data || []).slice(0, 10).map((record: any, index: number) => (
                <>
                  <Text key={`time-${index}`} p={2} borderBottomWidth={1} fontSize="sm">
                    {record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-'}
                  </Text>
                  <Text key={`emp-${index}`} p={2} borderBottomWidth={1} fontSize="sm">
                    {record.employee_name || record.employee_id}
                  </Text>
                  <Box key={`action-${index}`} p={2} borderBottomWidth={1}>
                    <Badge 
                      variant="solid"
                      colorPalette={record.check_out ? 'blue' : 'green'}
                      fontSize="xs"
                    >
                      {record.check_out ? 'Check Out' : 'Check In'}
                    </Badge>
                  </Box>
                  <Text key={`loc-${index}`} p={2} borderBottomWidth={1} fontSize="sm">
                    {record.site_location || 'N/A'}
                  </Text>
                </>
              ))}
            </Grid>

            {((todayAttendance as any)?.data || []).length === 0 && !attendanceLoading && (
              <Box p={4} borderRadius="md" bg="gray.50" borderColor="gray.200" borderWidth={1}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  No recent activities found for today.
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default SupervisorDashboard
