'use client';

import { useRouter } from 'next/navigation';
import { ErrorModal } from '@/app/components/modals';

export default function CustomErrorModal({ errorMsg }: { errorMsg: string }) {
  const router = useRouter();

  return (
    <ErrorModal
      isOpen={true}
      heading="Error Notification"
      errors={errorMsg}
      onClose={() => router.push('/')}
    />
  );
}
