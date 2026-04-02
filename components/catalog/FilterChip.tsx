'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        active && 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary'
      )}
    >
      {label}
    </Button>
  )
}

export { FilterChip }
