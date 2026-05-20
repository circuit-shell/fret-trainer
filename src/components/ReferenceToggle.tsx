import { PillSwitch } from './PillSwitch'
import { useTranslation } from '../hooks/useTranslation'

export interface ReferenceToggleProps {
  visible: boolean
  onChange: (visible: boolean) => void
}

export function ReferenceToggle({ visible, onChange }: ReferenceToggleProps) {
  const t = useTranslation()
  return (
    <PillSwitch
      checked={visible}
      onChange={onChange}
      label={t('settings.toggle.referenceNotes')}
    />
  )
}
