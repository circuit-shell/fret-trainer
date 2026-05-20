import { PillSwitch } from './PillSwitch'
import { useTranslation } from '../hooks/useTranslation'

export interface StringNumbersToggleProps {
  visible: boolean
  onChange: (visible: boolean) => void
}

export function StringNumbersToggle({ visible, onChange }: StringNumbersToggleProps) {
  const t = useTranslation()
  return (
    <PillSwitch
      checked={visible}
      onChange={onChange}
      label={t('settings.toggle.stringNumbers')}
    />
  )
}
