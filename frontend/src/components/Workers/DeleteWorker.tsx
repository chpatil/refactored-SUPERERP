// filepath: /Users/chinmaypatil/Documents/SuperERP/frontend/src/components/Workers/DeleteWorker.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { FaTrash } from "react-icons/fa"

import { Button, Text, IconButton } from "@chakra-ui/react"

import { WorkersService } from "../../client"
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

interface DeleteWorkerProps {
  workerId: string
}

export function DeleteWorker({ workerId }: DeleteWorkerProps) {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const [open, setOpen] = useState(false)

  const deleteWorker = useMutation({
    mutationFn: () => WorkersService.deleteWorker({ id: workerId }),
    onSuccess: () => {
      showSuccessToast("Worker deleted successfully.")
      setOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] })
    },
  })

  return (
    <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DialogTrigger asChild>
        <IconButton
          aria-label="Delete worker"
          size="sm"
          variant="ghost"
          colorPalette="red"
        >
          <FaTrash />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Worker</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            Are you sure you want to delete this worker? This action
            cannot be undone.
          </Text>
        </DialogBody>
        <DialogFooter>
          <DialogCloseTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogCloseTrigger>
          <Button
            colorPalette="red"
            onClick={() => deleteWorker.mutate()}
            loading={deleteWorker.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
