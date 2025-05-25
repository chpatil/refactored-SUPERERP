import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
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

import { type ApiError, type LeaveRequestCreate, LeaveRequestsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

interface AddLeaveRequestProps {
  isOpen: boolean
  onClose: () => void
}

const AddLeaveRequest = ({ isOpen, onClose }: AddLeaveRequestProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveRequestCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      leave_type: "",
      start_date: "",
      end_date: "",
      reason: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: LeaveRequestCreate) =>
      LeaveRequestsService.createLeaveRequest({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Leave request created successfully.", "success")
      reset()
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

  const onSubmit: SubmitHandler<LeaveRequestCreate> = (data) => {
    mutation.mutate(data)
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
          <ModalHeader>Add Leave Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.leave_type}>
              <FormLabel htmlFor="leave_type">Leave Type</FormLabel>
              <Select
                id="leave_type"
                {...register("leave_type", {
                  required: "Leave type is required",
                })}
                placeholder="Select leave type"
              >
                <option value="sick">Sick Leave</option>
                <option value="vacation">Vacation</option>
                <option value="personal">Personal Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
              </Select>
              {errors.leave_type && (
                <FormErrorMessage>{errors.leave_type.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.start_date}>
              <FormLabel htmlFor="start_date">Start Date</FormLabel>
              <Input
                id="start_date"
                type="date"
                {...register("start_date", {
                  required: "Start date is required",
                })}
              />
              {errors.start_date && (
                <FormErrorMessage>{errors.start_date.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.end_date}>
              <FormLabel htmlFor="end_date">End Date</FormLabel>
              <Input
                id="end_date"
                type="date"
                {...register("end_date", {
                  required: "End date is required",
                  validate: (value, formValues) => {
                    const startDate = new Date(formValues.start_date)
                    const endDate = new Date(value)
                    return endDate >= startDate || "End date must be after start date"
                  },
                })}
              />
              {errors.end_date && (
                <FormErrorMessage>{errors.end_date.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.reason}>
              <FormLabel htmlFor="reason">Reason</FormLabel>
              <Textarea
                id="reason"
                {...register("reason", {
                  required: "Reason is required",
                  maxLength: {
                    value: 500,
                    message: "Reason must be less than 500 characters",
                  },
                })}
                placeholder="Please provide a reason for your leave request"
              />
              {errors.reason && (
                <FormErrorMessage>{errors.reason.message}</FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Submit
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AddLeaveRequest
