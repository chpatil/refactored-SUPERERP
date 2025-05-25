import {
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  Input,
  Textarea,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type ApiError, type LeaveRequestCreate, LeaveRequestsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { Field } from "../ui/field"

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
      showToast.showSuccessToast("Leave request created successfully.")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast.showErrorToast(`${errDetail}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
    },
  })

  const onSubmit: SubmitHandler<LeaveRequestCreate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => e.open || onClose()}>
      <DialogBackdrop />
      <DialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Add Leave Request</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody pb={6}>
          <Field required invalid={!!errors.leave_type} errorText={errors.leave_type?.message} label="Leave Type">
            <Input
              id="leave_type"
              {...register("leave_type", {
                required: "Leave type is required",
              })}
              placeholder="Select leave type"
              list="leave-types"
            />
            <datalist id="leave-types">
              <option value="sick">Sick Leave</option>
              <option value="vacation">Vacation</option>
              <option value="personal">Personal Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
            </datalist>
          </Field>
          <Field mt={4} required invalid={!!errors.start_date} errorText={errors.start_date?.message} label="Start Date">
            <Input
              id="start_date"
              type="date"
              {...register("start_date", {
                required: "Start date is required",
              })}
            />
          </Field>
          <Field mt={4} required invalid={!!errors.end_date} errorText={errors.end_date?.message} label="End Date">
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
          </Field>
          <Field mt={4} required invalid={!!errors.reason} errorText={errors.reason?.message} label="Reason">
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
          </Field>
        </DialogBody>

        <DialogFooter gap={3}>
          <Button variant="solid" type="submit" loading={isSubmitting}>
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

export default AddLeaveRequest
