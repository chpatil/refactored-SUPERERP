import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  type LeaveRequestPublic,
  type LeaveRequestUpdate,
  LeaveRequestsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

interface EditLeaveRequestProps {
  leaveRequest: LeaveRequestPublic
  isOpen: boolean
  onClose: () => void
}

const EditLeaveRequest = ({
  leaveRequest,
  isOpen,
  onClose,
}: EditLeaveRequestProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<LeaveRequestUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      status: leaveRequest.status,
      supervisor_comments: leaveRequest.supervisor_comments || "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: LeaveRequestUpdate) =>
      LeaveRequestsService.updateLeaveRequest({
        id: leaveRequest.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showToast("Success!", "Leave request updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
    },
  })

  const onSubmit: SubmitHandler<LeaveRequestUpdate> = (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Review Leave Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Employee</FormLabel>
              <p>{leaveRequest.employee_id}</p>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Leave Type</FormLabel>
              <p>{leaveRequest.leave_type}</p>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Duration</FormLabel>
              <p>
                {new Date(leaveRequest.start_date).toLocaleDateString()} -{" "}
                {new Date(leaveRequest.end_date).toLocaleDateString()}
              </p>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Reason</FormLabel>
              <p>{leaveRequest.reason}</p>
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.status}>
              <FormLabel htmlFor="status">Status</FormLabel>
              <Select
                id="status"
                {...register("status", {
                  required: "Status is required",
                })}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
              {errors.status && (
                <FormErrorMessage>{errors.status.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isInvalid={!!errors.supervisor_comments}>
              <FormLabel htmlFor="supervisor_comments">
                Supervisor Comments
              </FormLabel>
              <Textarea
                id="supervisor_comments"
                {...register("supervisor_comments", {
                  maxLength: {
                    value: 500,
                    message: "Comments must be less than 500 characters",
                  },
                })}
                placeholder="Optional comments about the decision"
              />
              {errors.supervisor_comments && (
                <FormErrorMessage>
                  {errors.supervisor_comments.message}
                </FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Update
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default EditLeaveRequest
