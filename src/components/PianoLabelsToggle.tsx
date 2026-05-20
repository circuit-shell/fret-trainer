import { PillSwitch } from './PillSwitch'
import { useTranslation } from '../hooks/useTranslation'

export interface PianoLabelsToggleProps {
  visible: boolean
  onChange: (visible: boolean) => void
}

export function PianoLabelsToggle({ visible, onChange }: PianoLabelsToggleProps) {
  const t = useTranslation()
  return (
    <PillSwitch
      checked={visible}
      onChange={onChange}
      label={t('settings.toggle.pianoLabels')}
    />
  )
}
