import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';

type FormModalState = {
  showSuccessModal: boolean;
  showErrorModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  setShowErrorModal: (show: boolean) => void;
  closeAllModals: () => void;
};

type UseFormModalOptions<T> = {
  onSuccess?: (formState: FormState<T>) => void;
  onError?: (formState: FormState<T>) => void;
};

function useFormModal<T>(
  action: (
    prevState: FormState<T>,
    formData: FormData
  ) => Promise<FormState<T>> | FormState<T>,
  initialState: Awaited<FormState<T>>,
  options: UseFormModalOptions<T> = {}
): [FormState<T>, (formData: FormData) => void, FormModalState] {
  const [formState, formAction] = useFormState<FormState<T>, FormData>(
    action,
    initialState
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const { onSuccess, onError } = options;

  useEffect(() => {
    if (formState.formStatus === 'error') {
      setShowErrorModal(true);
      onError?.(formState);
      return;
    }
    if (formState.formStatus === 'success') {
      setShowSuccessModal(true);
      onSuccess?.(formState);
    }
  }, [formState, onSuccess, onError]);

  const closeAllModals = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
  };

  const modalState: FormModalState = {
    showSuccessModal,
    showErrorModal,
    setShowSuccessModal,
    setShowErrorModal,
    closeAllModals,
  };

  return [formState, formAction, modalState];
}

export { useFormModal };
export type { FormModalState };
