import { Ship, Plane, Truck, TrainFront, type LucideIcon } from 'lucide-react'

import type { Modal } from '@/types/domain'

export const MODAL_ICONS: Record<Modal, LucideIcon> = {
  maritimo: Ship,
  aereo: Plane,
  rodoviario: Truck,
  ferroviario: TrainFront,
}

export function ModalIcon({ modal, className }: { modal: Modal; className?: string }) {
  const Icone = MODAL_ICONS[modal]
  return <Icone className={className} />
}
