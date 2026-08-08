import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EditableField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'date' | 'email' | 'tel' | 'url'
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-muted-foreground text-xs font-normal">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8"
      />
    </div>
  )
}
