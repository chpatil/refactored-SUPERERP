import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  VStack,
  HStack,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { ReportsService } from "../../client"
import useAuth from "../../hooks/useAuth"

export const Route = createFileRoute("/_layout/reports")({
  component: Reports,
})

interface ReportFilters {
  start_date: string
  end_date: string
  site_location?: string
  team_name?: string
  supervisor_id?: string
  status?: string
}

function Reports() {
  const { user } = useAuth()
  const cardBg = useColorModeValue("white", "gray.800")
  const [activeReport, setActiveReport] = useState<string>("")
  const [filters, setFilters] = useState<ReportFilters>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end_date: new Date().toISOString().split('T')[0], // today
  })

  const { register, handleSubmit, watch } = useForm<ReportFilters>({
    defaultValues: filters,
  })

  // Attendance Summary Report
  const { data: attendanceSummary, isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance-summary", filters],
    queryFn: () => ReportsService.getAttendanceSummary(filters),
    enabled: activeReport === "attendance",
  })

  // Leave Summary Report
  const { data: leaveSummary, isLoading: leaveLoading } = useQuery({
    queryKey: ["leave-summary", filters],
    queryFn: () => ReportsService.getLeaveSummary(filters),
    enabled: activeReport === "leave",
  })

  // Team Performance Report
  const { data: teamPerformance, isLoading: teamLoading } = useQuery({
    queryKey: ["team-performance", filters],
    queryFn: () => ReportsService.getTeamPerformanceReport(filters),
    enabled: activeReport === "team",
  })

  const onSubmit = (data: ReportFilters) => {
    setFilters(data)
  }

  const generateReport = (reportType: string) => {
    setActiveReport(reportType)
  }

  return (
    <Container maxW="full" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Reports & Analytics</Heading>

        {/* Filters */}
        <Card bg={cardBg}>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Report Filters</Heading>
                
                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                  <FormControl>
                    <FormLabel>Start Date</FormLabel>
                    <Input
                      type="date"
                      {...register("start_date", { required: true })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      type="date"
                      {...register("end_date", { required: true })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Site Location</FormLabel>
                    <Input
                      placeholder="Optional"
                      {...register("site_location")}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Team Name</FormLabel>
                    <Input
                      placeholder="Optional"
                      {...register("team_name")}
                    />
                  </FormControl>
                </Grid>

                <HStack spacing={4} wrap="wrap">
                  <Button type="submit" colorScheme="blue">
                    Apply Filters
                  </Button>
                  <Button
                    onClick={() => generateReport("attendance")}
                    colorScheme="green"
                    variant={activeReport === "attendance" ? "solid" : "outline"}
                  >
                    Attendance Report
                  </Button>
                  <Button
                    onClick={() => generateReport("leave")}
                    colorScheme="purple"
                    variant={activeReport === "leave" ? "solid" : "outline"}
                  >
                    Leave Report
                  </Button>
                  <Button
                    onClick={() => generateReport("team")}
                    colorScheme="orange"
                    variant={activeReport === "team" ? "solid" : "outline"}
                  >
                    Team Performance
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {/* Attendance Summary Report */}
        {activeReport === "attendance" && (
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Attendance Summary Report</Heading>
                
                {attendanceLoading ? (
                  <Text>Loading...</Text>
                ) : attendanceSummary ? (
                  <>
                    {/* Summary Statistics */}
                    <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
                      <Stat>
                        <StatLabel>Total Records</StatLabel>
                        <StatNumber>{attendanceSummary.summary.total_attendance_records}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Unique Employees</StatLabel>
                        <StatNumber>{attendanceSummary.summary.unique_employees}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Hours</StatLabel>
                        <StatNumber>{attendanceSummary.summary.total_hours_worked}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Average Daily Attendance</StatLabel>
                        <StatNumber>{attendanceSummary.summary.average_daily_attendance}</StatNumber>
                      </Stat>
                    </Grid>

                    <Divider />

                    {/* Daily Breakdown */}
                    <VStack align="stretch">
                      <Heading size="sm">Daily Breakdown</Heading>
                      <TableContainer>
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th>Date</Th>
                              <Th>Employees Present</Th>
                              <Th>Checked Out</Th>
                              <Th>Total Hours</Th>
                              <Th>Avg Hours/Employee</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {attendanceSummary.daily_breakdown.map((day: any, index: number) => (
                              <Tr key={index}>
                                <Td>{new Date(day.date).toLocaleDateString()}</Td>
                                <Td>{day.employees_present}</Td>
                                <Td>{day.employees_checked_out}</Td>
                                <Td>{day.total_hours_worked}</Td>
                                <Td>{day.average_hours_per_employee}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </VStack>
                  </>
                ) : (
                  <Text>No data available for the selected period</Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Leave Summary Report */}
        {activeReport === "leave" && (
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Leave Summary Report</Heading>
                
                {leaveLoading ? (
                  <Text>Loading...</Text>
                ) : leaveSummary ? (
                  <>
                    {/* Summary Statistics */}
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                      <Stat>
                        <StatLabel>Total Requests</StatLabel>
                        <StatNumber>{leaveSummary.summary.total_requests}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Approved Leave Days</StatLabel>
                        <StatNumber>{leaveSummary.summary.approved_leave_days}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Status Breakdown</StatLabel>
                        <StatHelpText>
                          {Object.entries(leaveSummary.summary.status_breakdown).map(([status, count]: any) => (
                            <Badge key={status} mr={2} colorScheme={
                              status === 'approved' ? 'green' : 
                              status === 'rejected' ? 'red' : 'yellow'
                            }>
                              {status}: {count}
                            </Badge>
                          ))}
                        </StatHelpText>
                      </Stat>
                    </Grid>

                    <Divider />

                    {/* Leave Requests Table */}
                    <VStack align="stretch">
                      <Heading size="sm">Leave Requests</Heading>
                      <TableContainer>
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th>Employee ID</Th>
                              <Th>Leave Type</Th>
                              <Th>Start Date</Th>
                              <Th>End Date</Th>
                              <Th>Status</Th>
                              <Th>Reason</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {leaveSummary.requests.map((request: any) => (
                              <Tr key={request.id}>
                                <Td>{request.employee_id}</Td>
                                <Td>{request.leave_type}</Td>
                                <Td>{new Date(request.start_date).toLocaleDateString()}</Td>
                                <Td>{new Date(request.end_date).toLocaleDateString()}</Td>
                                <Td>
                                  <Badge colorScheme={
                                    request.status === 'approved' ? 'green' : 
                                    request.status === 'rejected' ? 'red' : 'yellow'
                                  }>
                                    {request.status}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Text isTruncated maxW="200px">
                                    {request.reason}
                                  </Text>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </VStack>
                  </>
                ) : (
                  <Text>No data available for the selected period</Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Team Performance Report */}
        {activeReport === "team" && (
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Team Performance Report</Heading>
                
                {teamLoading ? (
                  <Text>Loading...</Text>
                ) : teamPerformance ? (
                  <VStack align="stretch">
                    {teamPerformance.teams.map((team: any, index: number) => (
                      <Card key={index} variant="outline">
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <VStack align="start" spacing={0}>
                                <Heading size="sm">{team.team_name}</Heading>
                                <Text fontSize="sm" color="gray.500">
                                  {team.site_location || "No site specified"}
                                </Text>
                              </VStack>
                              <Badge colorScheme="blue">
                                {team.member_count} members
                              </Badge>
                            </HStack>

                            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                              <Stat size="sm">
                                <StatLabel>Total Attendance</StatLabel>
                                <StatNumber>{team.total_attendance_days}</StatNumber>
                              </Stat>
                              <Stat size="sm">
                                <StatLabel>Total Hours</StatLabel>
                                <StatNumber>{team.total_hours_worked}</StatNumber>
                              </Stat>
                              <Stat size="sm">
                                <StatLabel>Avg Attendance</StatLabel>
                                <StatNumber>{team.average_attendance_per_member}</StatNumber>
                              </Stat>
                              <Stat size="sm">
                                <StatLabel>Avg Hours</StatLabel>
                                <StatNumber>{team.average_hours_per_member}</StatNumber>
                              </Stat>
                            </Grid>

                            <TableContainer>
                              <Table size="sm">
                                <Thead>
                                  <Tr>
                                    <Th>Employee</Th>
                                    <Th>Employee ID</Th>
                                    <Th>Attendance Days</Th>
                                    <Th>Hours Worked</Th>
                                    <Th>Leave Days</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {team.members.map((member: any) => (
                                    <Tr key={member.employee_id}>
                                      <Td>{member.full_name}</Td>
                                      <Td>{member.employee_number}</Td>
                                      <Td>{member.attendance_days}</Td>
                                      <Td>{member.hours_worked}</Td>
                                      <Td>{member.leave_days}</Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </TableContainer>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : (
                  <Text>No data available for the selected period</Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  )
}

export default Reports
