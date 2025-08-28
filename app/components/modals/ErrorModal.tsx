import React from 'react';
import { Icon, IconName } from '@/app/components/IconSVG';
import { Modal } from '@/app/components/modal';
import { colors } from '@/app/customColors';

type ErrorModalProps = {
  isOpen: boolean;
  heading?: string;
  errors?: Record<string, string[]> | string;
  onClose: () => void;
};

function ErrorModal({
  isOpen,
  heading = 'Errors',
  errors,
  onClose,
}: ErrorModalProps) {
  if (!isOpen) return null;

  const renderErrorContent = () => {
    if (typeof errors === 'string') {
      return <p>{errors}</p>;
    }

    if (errors && typeof errors === 'object') {
      return (
        <ul>
          {Object.entries(errors).map(([key, value]) => (
            <li key={key}>
              {key}: {value.join(', ')}
            </li>
          ))}
        </ul>
      );
    }

    return <p>An unknown error occurred</p>;
  };

  return (
    <Modal
      heading={heading}
      bgColor={colors.moongray['800']}
      textColor="#FFFFFF"
      primaryBtnLabel="Close"
      enableScreenOverlay
      overlayOpacity={0.8}
      onCloseIconClick={onClose}
      onPrimaryBtnClick={onClose}>
      <div className="flex gap-2 items-start">
        <Icon
          name={IconName.Alert}
          size={40}
          color="red"
        />
        <div className="flex-1">{renderErrorContent()}</div>
      </div>
    </Modal>
  );
}

export { ErrorModal };
