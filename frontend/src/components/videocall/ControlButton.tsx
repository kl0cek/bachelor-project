import { memo } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../ui';

interface ControlButtonProps {
  onClick: () => void;
  isEnabled: boolean;
  enabledIcon: ReactNode;
  disabledIcon: ReactNode;
  danger?: boolean;
}

export const ControlButton = memo(
  ({ onClick, isEnabled, enabledIcon, disabledIcon, danger = false }: ControlButtonProps) => (
    <Button
      onClick={onClick}
      variant={isEnabled && !danger ? 'default' : 'outline'}
      size="lg"
      className={`rounded-full ${
        !isEnabled || danger ? 'bg-red-600 hover:bg-red-700 text-white border-none' : ''
      }`}
    >
      {isEnabled ? enabledIcon : disabledIcon}
    </Button>
  )
);

ControlButton.displayName = 'ControlButton';
