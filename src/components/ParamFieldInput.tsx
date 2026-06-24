import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ACCEPT_MAP } from '@/constants/mime'
import type { ParamField } from '@/features/types'

interface ParamFieldInputProps {
  field: ParamField
  value: string
  onChange: (value: string) => void
  onFileChange?: (file: File | null) => void
}

function FileParamField({
  field,
  value,
  onChange,
  onFileChange,
}: ParamFieldInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = `param-file-${field.key}`

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{field.label}</Label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={field.accept ?? ACCEPT_MAP.image}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          onChange(file?.name ?? '')
          onFileChange?.(file)
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Choose image
        </Button>
        {value ? (
          <span className="truncate text-sm text-muted-foreground">{value}</span>
        ) : (
          <span className="text-sm text-muted-foreground">PNG, JPG, or SVG</span>
        )}
      </div>
    </div>
  )
}

export function ParamFieldInput({ field, value, onChange, onFileChange }: ParamFieldInputProps) {
  switch (field.type) {
    case 'select':
      return (
        <div className="space-y-2">
          <Label>{field.label}</Label>
          <Select value={value || field.defaultValue} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Textarea
            id={field.key}
            placeholder={field.placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      )

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            type="number"
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      )

    case 'color':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            type="color"
            value={value || field.defaultValue || '#000000'}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      )

    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <input
            id={field.key}
            type="checkbox"
            checked={value === 'true'}
            onChange={(event) => onChange(event.target.checked ? 'true' : 'false')}
          />
          <Label htmlFor={field.key}>{field.label}</Label>
        </div>
      )

    case 'file':
      return (
        <FileParamField
          field={field}
          value={value}
          onChange={onChange}
          onFileChange={onFileChange}
        />
      )

    case 'password':
    case 'text':
    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            type={field.type === 'password' ? 'password' : 'text'}
            placeholder={field.placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      )
  }
}
