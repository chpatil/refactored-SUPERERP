import React from "react"
import { useQuery } from "@tanstack/react-query"
import { WorkersService } from "@/client/services.gen"
import { showErrorToast } from "@/utils/toast"
import { Table, Card, Badge, Text, Spinner, Center } from "@ark-ui/react"
import { EditWorker } from "./EditWorker"
import { DeleteWorker } from "./DeleteWorker"

export function WorkerList() {
  const {
    data: workers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["workers"],
    queryFn: () => WorkersService.readWorkers(),
  })

  React.useEffect(() => {
    if (isError && error) {
      showErrorToast(error.message || "Error loading workers")
    }
  }, [isError, error])

  if (isLoading) {
    return (
      <Center h="200px">
        <Spinner size="lg" />
      </Center>
    )
  }

  return (
    <Card>
      <Table variant="simple">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Gender</Table.ColumnHeader>
            <Table.ColumnHeader>Department</Table.ColumnHeader>
            <Table.ColumnHeader>Aadhar</Table.ColumnHeader>
            <Table.ColumnHeader>Bank Details</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {workers?.data.map((worker) => (
            <Table.Row key={worker.id}>
              <Table.Cell>{worker.name}</Table.Cell>
              <Table.Cell>{worker.gender || "N/A"}</Table.Cell>
              <Table.Cell>{worker.department || "N/A"}</Table.Cell>
              <Table.Cell>{worker.aadhar || "N/A"}</Table.Cell>
              <Table.Cell>
                {worker.bankname ? (
                  <>
                    {worker.bankname}
                    {worker.accountno && (
                      <Badge ml="2" colorScheme="gray">
                        A/C: {worker.accountno.slice(-4)}
                      </Badge>
                    )}
                  </>
                ) : (
                  "N/A"
                )}
              </Table.Cell>
              <Table.Cell>
                <EditWorker worker={worker} />
                <DeleteWorker worker={worker} />
              </Table.Cell>
            </Table.Row>
          ))}
          {workers?.data.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <Text align="center" py={4}>
                  No workers found
                </Text>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Card>
  )
}