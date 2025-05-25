import useCustomToast from "@/hooks/useCustomToast"

export const showSuccessToast = (description: string) => {
  const { showSuccessToast } = useCustomToast()
  showSuccessToast(description)
}

export const showErrorToast = (description: string) => {
  const { showErrorToast } = useCustomToast()
  showErrorToast(description)
}
