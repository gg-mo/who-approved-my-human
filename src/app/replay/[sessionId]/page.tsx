import { notFound } from 'next/navigation';

import { ReplayExperience } from '@/components/results/ReplayExperience';
import { getSessionResultById } from '@/lib/server/session-service';

type ParamsContext = {
  params: { sessionId: string } | Promise<{ sessionId: string }>;
};

export default async function ReplayPage(context: ParamsContext) {
  const { sessionId } = await Promise.resolve(context.params);
  const result = await getSessionResultById(sessionId);

  if (!result) {
    notFound();
  }

  return <ReplayExperience result={result} sessionId={sessionId} />;
}
