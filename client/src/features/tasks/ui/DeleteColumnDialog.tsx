import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { SelectField } from '@/shared/ui/SelectField'
import type { BoardColumn } from '@/features/tasks/model/types'

type DeleteColumnDialogProps = {
  open: boolean
  column: BoardColumn | null
  otherColumns: BoardColumn[]
  cardCount: number
  moveToId: string
  isPending?: boolean
  onMoveToChange: (id: string) => void
  onClose: () => void
  onConfirm: () => void
}

export function DeleteColumnDialog({
  open,
  column,
  otherColumns,
  cardCount,
  moveToId,
  isPending = false,
  onMoveToChange,
  onClose,
  onConfirm,
}: DeleteColumnDialogProps) {
  if (!column) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete column"
      subtitle={
        cardCount > 0
          ? `Move ${cardCount} card${cardCount === 1 ? '' : 's'} to another column, then delete “${column.name}”.`
          : `Delete “${column.name}”? This cannot be undone.`
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            size="md"
            className="bg-danger hover:opacity-95 focus-visible:ring-danger"
            onClick={onConfirm}
            disabled={
              isPending || (cardCount > 0 && (!moveToId || otherColumns.length === 0))
            }
          >
            {isPending ? 'Deleting…' : 'Delete column'}
          </Button>
        </div>
      }
    >
      {cardCount > 0 && (
        <label className="block text-sm font-medium text-label">
          Move cards to
          <SelectField
            value={moveToId}
            onChange={(e) => onMoveToChange(e.target.value)}
            className="mt-2 !h-10 w-full rounded-lg text-sm"
          >
            {otherColumns.length === 0 && <option value="">No other columns</option>}
            {otherColumns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </label>
      )}
    </Modal>
  )
}
