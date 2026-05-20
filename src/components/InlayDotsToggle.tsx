import { PillSwitch } from './PillSwitch'
import { useTranslation } from '../hooks/useTranslation'

export interface InlayDotsToggleProps {
  visible: boolean
  onChange: (visible: boolean) => void
}

export function InlayDotsToggle({ visible, onChange }: InlayDotsToggleProps) {
  const t = useTranslation()
  return (
    <PillSwitch
      checked={visible}
      onChange={onChange}
      label={t('settings.toggle.inlayDots')}
    />
  )
}
