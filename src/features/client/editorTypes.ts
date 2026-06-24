import type { RotationAngle } from '@/features/client/rotate'

export interface OrganizePageState {
  id: string
  sourceIndex: number
  rotation: RotationAngle
  deleted: boolean
}

export type TextFontFamily = 'helvetica' | 'times' | 'courier'

export type TextAlign = 'left' | 'center' | 'right'

export interface TextCoverRect {
  x: number
  y: number
  width: number
  height: number
  color: string
}

export interface TextAnnotation {
  id: string
  pageIndex: number
  type: 'text'
  x: number
  y: number
  text: string
  fontSize: number
  color: string
  width?: number
  align?: TextAlign
  fontFamily?: TextFontFamily
  cover?: TextCoverRect
  origin: 'new' | 'existing'
  /** Source text-run id when promoted from existing PDF text */
  sourceRunId?: string
}

export interface ImageAnnotation {
  id: string
  pageIndex: number
  type: 'image'
  x: number
  y: number
  width: number
  height: number
  imageBytes: Uint8Array
  mimeType: string
}

export type Annotation = TextAnnotation | ImageAnnotation

export interface TextRun {
  id: string
  pageIndex: number
  text: string
  xPdf: number
  yPdf: number
  width: number
  height: number
  fontSize: number
}
