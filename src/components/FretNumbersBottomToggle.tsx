import { PillSwitch } from './PillSwitch'
import { useTranslation } from '../hooks/useTranslation'

export interface FretNumbersBottomToggleProps {
  visible: boolean
  onChange: (visible: boolean) => void
}

export function FretNumbersBottomToggle({ visible, onChange }: FretNumbersBottomToggleProps) {
  const t = useTranslation()
  return (
    <PillSwitch
      checked={visible}
      onChange={onChange}
      label={t('settings.toggle.fretNumbersBottom')}
    />
  )
}
