// filepath: /Users/chinmaypatil/Documents/SuperERP/frontend/src/components/Workers/AddWorker.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"

import {
  Button,
  Input,
  Grid,
  GridItem,
} from "@chakra-ui/react"

import { type WorkerCreate, WorkersService } from "../../client"
import type { ApiError } from "../../client/core/ApiError"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

// Export the function directly as a named export
export function AddWorker() {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const [open, setOpen] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkerCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      gender: "",
      department: "",
      address: "",
      aadhar: "",
      bankname: "",
      ifscode: "",
      accountno: "",
      pfno: "",
      esicno: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: WorkerCreate) =>
      WorkersService.createWorker({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Worker created successfully.")
      reset()
      setOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] })
    },
  })

  const onSubmit: SubmitHandler<WorkerCreate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DialogTrigger asChild>
        <Button
          variant="solid"
          colorPalette="blue"
          size="sm"
        >
          <FaPlus />
          Add Worker
        </Button>
      </DialogTrigger>
      <DialogContent maxWidth="800px">
        <DialogHeader>
          <DialogTitle>Add New Worker</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            id="add-worker-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <Field
                  label="Full Name"
                  invalid={!!errors.name}
                  errorText={errors.name?.message}
                  required
                >
                  <Input
                    {...register("name", {
                      required: "Name is required.",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters."
                      }
                    })}
                    placeholder="Enter full name"
                  />
                </Field>
              </GridItem>
              
              <GridItem>
                <Field
                  label="Gender"
                  invalid={!!errors.gender}
                  errorText={errors.gender?.message}
                >
                  <Input
                    {...register("gender")}
                    placeholder="Enter gender"
                  />
                </Field>
              </GridItem>
              
              <GridItem>
                <Field
                  label="Department"
                  invalid={!!errors.department}
                  errorText={errors.department?.message}
                >
                  <Input
                    {...register("department")}
                    placeholder="Enter department"
                  />
                </Field>
              </GridItem>
              
              <GridItem>
                <Field
                  label="Aadhar Number"
                  invalid={!!errors.aadhar}
                  errorText={errors.aadhar?.message}
                >
                  <Input
                    {...register("aadhar", {
                      pattern: {
                        value: /^\d{12}$/,
                        message: "Aadhar must be 12 digits"
                      }
                    })}
                    placeholder="Enter 12-digit Aadhar number"
                    maxLength={12}
                  />
                </Field>
              </GridItem>
              
              <GridItem colSpan={2}>
                <Field
                  label="Address"
                  invalid={!!errors.address}
                  errorText={errors.address?.message}
                >
                  <Input
                    {...register("address")}
                    placeholder="Enter complete address"
                  />
                </Field>
              </GridItem>
              
              <GridItem>
                <Field
                  label="Bank Name"
                  invalid={!!errors.bankname}
                  errorText={errors.bankname?.message}
                >
                  <Input
                    {...register("bankname")}
                    placeholder="Enter bank name"
                  />
                </Field>
              </GridItem>
              
              <GridItem>
                <Field
                  label="IFSC Code"
                  invalid={!!errors.ifscode}
                  errorText={errors.ifscode?.message}
                >
                  <Input
                    {...register("ifscode", {
                      pattern: {
                        value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                        message: "Invalid IFSC code format"
                      }
                    })}
                    placeholder="Enter IFSC code"
                    style={{ textTransform: "uppercase" }}
                  />
                </Field>
              </GridItem>
              
              <GridItem>
                <Field
                  label="Account Number"
                  invalid={!!errors.accountno}
                  errorText={errors.accountno?.message}
                >
                  <Input
                    {...register("accountno")}
                    placeholder="Enter account number"
                  />
                </Field>
              </GridItem>
              
              <GridItem>
                <Field
                  label="PF Number"
                  invalid={!!errors.pfno}
                  errorText={errors.pfno?.message}
                >
                  <Input
                    {...register("pfno")}
                    placeholder="Enter PF number"
                  />
                </Field>
              </GridItem>
              
              <GridItem>
                <Field
                  label="ESIC Number"
                  invalid={!!errors.esicno}
                  errorText={errors.esicno?.message}
                >
                  <Input
                    {...register("esicno")}
                    placeholder="Enter ESIC number"
                  />
                </Field>
              </GridItem>
            </Grid>
          </form>
        </DialogBody>
        <DialogFooter>
          <DialogCloseTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogCloseTrigger>
          <Button
            form="add-worker-form"
            type="submit"
            loading={isSubmitting}
            colorPalette="blue"
          >
            Add Worker
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
