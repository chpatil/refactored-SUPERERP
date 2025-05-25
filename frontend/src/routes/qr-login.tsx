import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/qr-login')({
  component: () => <div>Hello /qr-login!</div>
})