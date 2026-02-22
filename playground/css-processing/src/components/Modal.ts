/**
 * Modal component
 */

export interface ModalProps {
  title: string
  children: string
  isOpen?: boolean
  onClose?: () => void
}

export function Modal({
  title,
  children,
  isOpen = false,
  onClose,
}: ModalProps): string {
  if (!isOpen) return ''

  return `
    <div class="modal-overlay" onclick="${onClose}">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="btn btn-outline" onclick="${onClose}">×</button>
        </div>
        <div class="modal-body">${children}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="${onClose}">Close</button>
          <button class="btn btn-primary">Confirm</button>
        </div>
      </div>
    </div>
  `
}
