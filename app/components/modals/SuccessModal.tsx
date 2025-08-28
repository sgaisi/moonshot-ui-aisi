import React from 'react';
import { Modal } from '@/app/components/modal';
import { colors } from '@/app/customColors';

type SuccessModalProps = {
  isOpen: boolean;
  heading?: string;
  message: string;
  primaryBtnLabel?: string;
  secondaryBtnLabel?: string;
  onClose: () => void;
  onPrimaryBtnClick?: () => void;
  onSecondaryBtnClick?: () => void;
};

function SuccessModal({
  isOpen,
  heading = 'Success',
  message,
  primaryBtnLabel,
  secondaryBtnLabel,
  onClose,
  onPrimaryBtnClick,
  onSecondaryBtnClick,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      heading={heading}
      bgColor={colors.moongray['800']}
      textColor="#FFFFFF"
      primaryBtnLabel={primaryBtnLabel}
      secondaryBtnLabel={secondaryBtnLabel}
      enableScreenOverlay
      overlayOpacity={0.8}
      onCloseIconClick={onClose}
      onPrimaryBtnClick={onPrimaryBtnClick}
      onSecondaryBtnClick={onSecondaryBtnClick}>
      <div className="flex gap-2 items-start">
        <p>{message}</p>
      </div>
    </Modal>
  );
}

export { SuccessModal };
