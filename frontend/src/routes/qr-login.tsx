import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import QRCode from "qrcode"

import { type ApiError, QRAuthService } from "../../client"
import useAuth from "../../hooks/useAuth"
import useCustomToast from "../../hooks/useCustomToast"

export const Route = createFileRoute("/qr-login")({
  component: QRLogin,
})

interface QRLoginForm {
  employee_id: string
  qr_code: string
}

function QRLogin() {
  const { login } = useAuth()
  const router = useRouter()
  const showToast = useCustomToast()
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const [qrCodeImage, setQrCodeImage] = useState<string>("")
  const [scanMode, setScanMode] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<QRLoginForm>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  // Generate QR Code
  const generateQRMutation = useMutation({
    mutationFn: () => QRAuthService.generateQrCode(),
    onSuccess: async (data) => {
      setQrCodeData(data.code)
      const qrImageUrl = await QRCode.toDataURL(data.code)
      setQrCodeImage(qrImageUrl)
      setCountdown(300) // 5 minutes countdown
      
      // Auto-refresh QR code status
      const interval = setInterval(async () => {
        try {
          const status = await QRAuthService.checkQrStatus({ code: data.code })
          if (!status.valid) {
            clearInterval(interval)
            setQrCodeData("")
            setQrCodeImage("")
            setCountdown(0)
            showToast("QR Code Expired", "Please generate a new QR code", "warning")
          }
        } catch (error) {
          clearInterval(interval)
        }
      }, 5000)

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            clearInterval(interval)
            setQrCodeData("")
            setQrCodeImage("")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail
      showToast("Error", `Failed to generate QR code: ${errDetail}`, "error")
    },
  })

  // Validate QR Code and Login
  const loginMutation = useMutation({
    mutationFn: (data: QRLoginForm) =>
      QRAuthService.validateQrCode({
        qrCode: data.qr_code,
        employeeId: data.employee_id,
      }),
    onSuccess: (data) => {
      login(data.access_token)
      router.navigate({ to: "/" })
      showToast("Success!", "Login successful.", "success")
    },
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail
      showToast("Login failed.", `${errDetail}`, "error")
    },
  })

  const onSubmit: SubmitHandler<QRLoginForm> = (data) => {
    loginMutation.mutate(data)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Container
      as="main"
      maxW="md"
      h="100vh"
      display="flex"
      flexDir="column"
      justifyContent="center"
    >
      <Box
        w="full"
        maxW="md"
        mx="auto"
        bg={useColorModeValue("white", "ui.dark")}
        p={8}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Heading textAlign="center" size="lg" mb={6}>
          QR Code Login
        </Heading>

        {!scanMode ? (
          <VStack spacing={6}>
            <Text textAlign="center" color="ui.dim">
              Generate a QR code for secure login
            </Text>

            {!qrCodeImage ? (
              <Button
                onClick={() => generateQRMutation.mutate()}
                isLoading={generateQRMutation.isPending}
                colorScheme="blue"
                size="lg"
                w="full"
              >
                Generate QR Code
              </Button>
            ) : (
              <VStack spacing={4}>
                <Box
                  p={4}
                  bg="white"
                  borderRadius="md"
                  boxShadow="md"
                >
                  <img src={qrCodeImage} alt="QR Code" width="200" height="200" />
                </Box>
                
                {countdown > 0 && (
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>QR Code Active</AlertTitle>
                      <AlertDescription>
                        Expires in: {formatTime(countdown)}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                <Button
                  onClick={() => setScanMode(true)}
                  colorScheme="green"
                  size="lg"
                  w="full"
                >
                  I've Scanned the Code
                </Button>

                <Button
                  onClick={() => generateQRMutation.mutate()}
                  variant="outline"
                  size="sm"
                >
                  Generate New Code
                </Button>
              </VStack>
            )}

            <Text textAlign="center" fontSize="sm" color="ui.dim">
              Scan the QR code with your mobile device, then proceed to enter your employee ID
            </Text>
          </VStack>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.employee_id}>
                <FormLabel htmlFor="employee_id">Employee ID</FormLabel>
                <Input
                  id="employee_id"
                  placeholder="Enter your employee ID"
                  {...register("employee_id", {
                    required: "Employee ID is required",
                  })}
                />
                {errors.employee_id && (
                  <FormErrorMessage>{errors.employee_id.message}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.qr_code}>
                <FormLabel htmlFor="qr_code">QR Code</FormLabel>
                <Input
                  id="qr_code"
                  placeholder="QR code will be filled automatically"
                  value={qrCodeData}
                  {...register("qr_code", {
                    required: "QR code is required",
                  })}
                  readOnly
                />
                {errors.qr_code && (
                  <FormErrorMessage>{errors.qr_code.message}</FormErrorMessage>
                )}
              </FormControl>

              <Button
                type="submit"
                isLoading={isSubmitting}
                colorScheme="blue"
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
