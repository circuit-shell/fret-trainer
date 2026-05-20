import { PillSwitch } from './PillSwitch'
import { useTranslation } from '../hooks/useTranslation'

export interface FretNumbersTopToggleProps {
  visible: boolean
  onChange: (visible: boolean) => void
}

export function FretNumbersTopToggle({ visible, onChange }: FretNumbersTopToggleProps) {
  const t = useTranslation()
  return (
    <PillSwitch
      checked={visible}
      onChange={onChange}
      label={t('settings.toggle.fretNumbersTop')}
    />
  )
}
