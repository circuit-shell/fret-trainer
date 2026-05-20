import { PillSwitch } from './PillSwitch'
import { useTranslation } from '../hooks/useTranslation'

export interface BlackKeyLabelsToggleProps {
  visible: boolean
  onChange: (visible: boolean) => void
}

// Sibling toggle to PianoLabelsToggle: PianoLabelsToggle controls the letter
// on white keys; this one controls the stacked sharp/flat labels on black keys.
export function BlackKeyLabelsToggle({ visible, onChange }: BlackKeyLabelsToggleProps) {
  const t = useTranslation()
  return (
    <PillSwitch
      checked={visible}
      onChange={onChange}
      label={t('settings.toggle.blackKeyLabels')}
    />
  )
}
