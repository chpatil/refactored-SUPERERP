import React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { showSuccessToast } from "@/utils/toast"
import { handleError } from "@/utils/error"
import { WorkersService } from "@/client/services.gen"
import { WorkerPublic } from "@/client/types.gen"
import { ApiError } from "@/client/core/ApiError"
import { FaTrash } from "react-icons/fa"

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
  Text,
} from "@ark-ui/react"

interface DeleteWorkerProps {
  worker: WorkerPublic
}

export function DeleteWorker({ worker }: DeleteWorkerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => WorkersService.deleteWorker({ id: worker.id }),
    onSuccess: () => {
      showSuccessToast("Worker deleted successfully.")
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] })
    },
  })

  const handleDelete = () => {
    mutation.mutate()
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" colorPalette="red">
          <FaTrash fontSize="16px" />
          Delete Worker
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Worker</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            Are you sure you want to delete worker "{worker.name}"? This action cannot be
            undone.
          </Text>
        </DialogBody>
        <DialogFooter gap={2}>
          <DialogActionTrigger asChild>
            <Button variant="subtle" colorPalette="gray">
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            colorPalette="red"
            onClick={handleDelete}
            loading={mutation.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}