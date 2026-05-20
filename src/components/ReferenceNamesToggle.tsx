import { PillSwitch } from './PillSwitch'
import { useTranslation } from '../hooks/useTranslation'

export interface ReferenceNamesToggleProps {
  visible: boolean
  disabled?: boolean
  onChange: (visible: boolean) => void
}

export function ReferenceNamesToggle({
  visible,
  disabled = false,
  onChange,
}: ReferenceNamesToggleProps) {
  const t = useTranslation()
  return (
    <PillSwitch
      checked={visible}
      onChange={onChange}
      label={t('settings.toggle.referenceNames')}
      disabled={disabled}
    />
  )
}
