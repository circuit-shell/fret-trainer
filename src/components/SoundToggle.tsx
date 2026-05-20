import { PillSwitch } from './PillSwitch'
import { useTranslation } from '../hooks/useTranslation'

export interface SoundToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export function SoundToggle({ enabled, onChange }: SoundToggleProps) {
  const t = useTranslation()
  return (
    <PillSwitch
      checked={enabled}
      onChange={onChange}
      label={t('settings.toggle.sound')}
    />
  )
}
