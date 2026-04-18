/**
 * Reality Check 方法多選元件
 * 基於 TagChip，支援複數選擇
 */

import TagChip from './TagChip'
import { RCMethod, RC_METHODS } from '../types/realityCheck'

interface RCMethodMultiSelectProps {
  selected: RCMethod[]
  onChange: (methods: RCMethod[]) => void
}

export default function RCMethodMultiSelect({ selected, onChange }: RCMethodMultiSelectProps): JSX.Element {
  const handleToggle = (method: RCMethod) => {
    if (selected.includes(method)) {
      onChange(selected.filter((m) => m !== method))
    } else {
      onChange([...selected, method])
    }
  }

  return (
    <div>
      <label className="block text-body font-medium text-text-primary mb-2">Reality Check 方法</label>
      <div className="flex flex-wrap gap-2">
        {RC_METHODS.map((method) => (
          <TagChip
            key={method}
            tag={method}
            onClick={() => handleToggle(method)}
            variant={selected.includes(method) ? 'filled' : 'outline'}
          />
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-small text-text-secondary mt-2">至少需選擇一個方法</p>
      )}
    </div>
  )
}
