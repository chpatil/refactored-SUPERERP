import React from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { showSuccessToast } from "@/utils/toast"
import { handleError } from "@/utils/error"
import { WorkersService } from "@/client/services.gen"
import { WorkerPublic, WorkerUpdate } from "@/client/types.gen"
import { ApiError } from "@/client/core/ApiError"
import { FaExchangeAlt } from "react-icons/fa"

import {
  Button,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
  Field,
} from "@ark-ui/react"

interface EditWorkerProps {
  worker: WorkerPublic
}

export function EditWorker({ worker }: EditWorkerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<WorkerUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: worker.name,
      gender: worker.gender || "",
      department: worker.department || "",
      address: worker.address || "",
      aadhar: worker.aadhar || "",
      bankname: worker.bankname || "",
      ifscode: worker.ifscode || "",
      accountno: worker.accountno || "",
      pfno: worker.pfno || "",
      esicno: worker.esicno || "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: WorkerUpdate) =>
      WorkersService.updateWorker({
        id: worker.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("Worker updated successfully.")
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] })
    },
  })

  const onSubmit: SubmitHandler<WorkerUpdate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost">
          <FaExchangeAlt fontSize="16px" />
          Edit Worker
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update the worker details below.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Name"
              >
                <Input
                  id="name"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  placeholder="Name"
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.gender}
                errorText={errors.gender?.message}
                label="Gender"
              >
                <Input
                  id="gender"
                  {...register("gender")}
                  placeholder="Gender"
                  type="text"
                />
              </Field>
              
              <Field
                invalid={!!errors.department}
                errorText={errors.department?.message}
                label="Department"
              >
                <Input
                  id="department"
                  {...register("department")}
                  placeholder="Department"
                  type="text"
                />
              </Field>
              
              <Field
                invalid={!!errors.address}
                errorText={errors.address?.message}
                label="Address"
              >
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Address"
                  type="text"
                />
              </Field>
              
              <Field
                invalid={!!errors.aadhar}
                errorText={errors.aadhar?.message}
                label="Aadhar"
              >
                <Input
                  id="aadhar"
                  {...register("aadhar")}
                  placeholder="Aadhar Number"
                  type="text"
                />
              </Field>
              
              <Field
                invalid={!!errors.bankname}
                errorText={errors.bankname?.message}
                label="Bank Name"
              >
                <Input
                  id="bankname"
                  {...register("bankname")}
                  placeholder="Bank Name"
                  type="text"
                />
              </Field>
              
              <Field
                invalid={!!errors.ifscode}
                errorText={errors.ifscode?.message}
                label="IFSC Code"
              >
                <Input
                  id="ifscode"
                  {...register("ifscode")}
                  placeholder="IFSC Code"
                  type="text"
                />
              </Field>
              
              <Field
                invalid={!!errors.accountno}
                errorText={errors.accountno?.message}
                label="Account Number"
              >
                <Input
                  id="accountno"
                  {...register("accountno")}
                  placeholder="Account Number"
                  type="text"
                />
              </Field>
              
              <Field
                invalid={!!errors.pfno}
                errorText={errors.pfno?.message}
                label="PF Number"
              >
                <Input
                  id="pfno"
                  {...register("pfno")}
                  placeholder="PF Number"
                  type="text"
                />
              </Field>
              
              <Field
                invalid={!!errors.esicno}
                errorText={errors.esicno?.message}
                label="ESIC Number"
              >
                <Input
                  id="esicno"
                  {...register("esicno")}
                  placeholder="ESIC Number"
                  type="text"
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button variant="subtle" colorPalette="gray">
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
            >
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  )
}