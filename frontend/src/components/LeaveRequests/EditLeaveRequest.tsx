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

import {
  type ApiError,
  type LeaveRequestPublic,
  type LeaveRequestUpdate,
  LeaveRequestsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { Field } from "../ui/field"

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
      showToast.showSuccessToast("Leave request updated successfully.")
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

  const onSubmit: SubmitHandler<LeaveRequestUpdate> = (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    onClose()
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => e.open || onClose()}>
      <DialogBackdrop />
      <DialogContent asChild>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Field label="Employee">
              <p>{leaveRequest.employee_id}</p>
            </Field>
            <Field label="Leave Type">
              <p>{leaveRequest.leave_type}</p>
            </Field>
            <Field label="Duration">
              <p>
                {new Date(leaveRequest.start_date).toLocaleDateString()} -{" "}
                {new Date(leaveRequest.end_date).toLocaleDateString()}
              </p>
            </Field>
            <Field label="Reason">
              <p>{leaveRequest.reason}</p>
            </Field>
            <Field
              required
              invalid={!!errors.status}
              errorText={errors.status?.message}
              label="Status"
            >
              <Input
                id="status"
                {...register("status", {
                  required: "Status is required",
                })}
                list="status-options"
              />
              <datalist id="status-options">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </datalist>
            </Field>
            <Field
              invalid={!!errors.supervisor_comments}
              errorText={errors.supervisor_comments?.message}
              label="Supervisor Comments"
            >
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
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="solid" type="submit" loading={isSubmitting}>
              Update
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  )
}

export default EditLeaveRequest
