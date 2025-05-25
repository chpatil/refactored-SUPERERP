import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useState } from "react"
import QRCode from "qrcode"

import { type ApiError } from "../client"
import useCustomToast from "../hooks/useCustomToast"
import { Field } from "../components/ui/field"

export const Route = createFileRoute("/qr-login")({
  component: QRLogin,
})

interface QRLoginForm {
  employee_id: string
  qr_code: string
}

function QRLogin() {
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const [qrCodeImage, setQrCodeImage] = useState<string>("")
  const [scanMode, setScanMode] = useState(false)
  const showToast = useCustomToast()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QRLoginForm>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  // Generate QR Code
  const generateQRMutation = useMutation({
    mutationFn: async () => {
      // Mock QR generation for now since QRAuthService is not available
      const code = Math.random().toString(36).substring(2, 15)
      return { code }
    },
    onSuccess: async (data: any) => {
      setQrCodeData(data.code)
      const qrImageUrl = await QRCode.toDataURL(data.code)
      setQrCodeImage(qrImageUrl)

      // Start polling for QR code status
      const interval = setInterval(async () => {
        try {
          // Mock status check since QRAuthService is not available
          const mockStatus = Math.random() > 0.8 // 20% chance of success
          if (mockStatus) {
            clearInterval(interval)
            showToast.showSuccessToast("Login successful!")
            router.navigate({ to: "/attendance" })
          }
        } catch (error: any) {
          clearInterval(interval)
          setQrCodeImage("")
          showToast.showErrorToast(error?.body?.detail || "QR code expired")
        }
      }, 3000)

      // Clear interval after 2 minutes
      setTimeout(() => {
        clearInterval(interval)
        setQrCodeImage("")
        showToast.showErrorToast("QR code expired")
      }, 120000)
    },
    onError: (err: ApiError) => {
      showToast.showErrorToast((err.body as any)?.detail || "Failed to generate QR code")
    },
  })

  // Manual Login
  const loginMutation = useMutation({
    mutationFn: async (data: QRLoginForm) => {
      // Mock login since QRAuthService is not available
      return { access_token: "mock_token" }
    },
    onSuccess: () => {
      showToast.showSuccessToast("Login successful!")
      router.navigate({ to: "/attendance" })
    },
    onError: (err: ApiError) => {
      showToast.showErrorToast((err.body as any)?.detail || "Login failed")
    },
  })

  const onSubmit: SubmitHandler<QRLoginForm> = async (data) => {
    loginMutation.mutate(data)
  }

  return (
    <Container maxW="md" h="100vh" display="flex" alignItems="center" justifyContent="center">
      <Box
        p={8}
        w="full"
        maxW="md"
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        {!scanMode ? (
          <VStack gap={6}>
            <Heading size="lg" textAlign="center" color="ui.main">
              QR Code Login
            </Heading>

            <Button
              onClick={() => generateQRMutation.mutate()}
              loading={generateQRMutation.isPending}
              variant="solid"
              colorPalette="blue"
              size="lg"
              w="full"
            >
              Generate QR Code
            </Button>

            {qrCodeImage && (
              <VStack gap={4}>
                <Box p={4} bg="white" borderRadius="md" boxShadow="md">
                  <img src={qrCodeImage} alt="QR Code" width="200" height="200" />
                </Box>
                
                <Box p={4} borderRadius="md" bg="blue.50" borderColor="blue.200" borderWidth={1}>
                  <Text fontSize="sm" color="blue.600" fontWeight="medium">
                    Scan this QR code with your mobile device to login
                  </Text>
                </Box>
              </VStack>
            )}

            <Text textAlign="center" fontSize="sm" color="gray.600">
              Or{" "}
              <Button variant="ghost" size="sm" onClick={() => setScanMode(true)}>
                login manually
              </Button>
            </Text>
          </VStack>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={4}>
              <Heading size="md" textAlign="center">
                Manual Login
              </Heading>

              <Field 
                label="Employee ID"
                invalid={!!errors.employee_id}
                errorText={errors.employee_id?.message}
              >
                <Input
                  placeholder="Enter your employee ID"
                  {...register("employee_id", {
                    required: "Employee ID is required",
                  })}
                />
              </Field>

              <Field 
                label="QR Code"
                invalid={!!errors.qr_code}
                errorText={errors.qr_code?.message}
              >
                <Input
                  placeholder="QR code will be filled automatically"
                  value={qrCodeData}
                  {...register("qr_code", {
                    required: "QR code is required",
                  })}
                  readOnly
                />
              </Field>

              <Button
                type="submit"
                loading={isSubmitting}
                variant="solid"
                colorPalette="blue"
                size="lg"
                w="full"
              >
                Login
              </Button>

              <Button
                onClick={() => setScanMode(false)}
                variant="ghost"
                size="sm"
              >
                Back to QR Code
              </Button>
            </VStack>
          </form>
        )}
      </Box>
    </Container>
  )
}

export default QRLogin
