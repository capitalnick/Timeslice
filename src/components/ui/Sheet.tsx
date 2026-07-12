import { useEffect, type ReactNode } from 'react'
import { IconButton } from './Button'
import { XIcon } from './Icons'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Optional sticky footer (e.g. primary action). */
  footer?: ReactNode
}

/**
 * A bottom sheet on mobile that becomes a centred modal on wider screens.
 * Closes on backdrop click and Escape.
 */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-fade-in relative flex max-h-[92vh] w-full flex-col rounded-t-3xl border border-slate-800 bg-slate-900 shadow-2xl sm:max-w-md sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <XIcon />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-slate-800 px-5 py-4 pb-safe">{footer}</div>
        )}
      </div>
    </div>
  )
}
