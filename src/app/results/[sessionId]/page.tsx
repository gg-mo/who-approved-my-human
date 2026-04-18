import { notFound } from 'next/navigation';

import { ResultsExperience } from '@/components/results/ResultsExperience';
import { getSessionResultById } from '@/lib/server/session-service';

type ParamsContext = {
  params: { sessionId: string } | Promise<{ sessionId: string }>;
};

export default async function ResultsPage(context: ParamsContext) {
  const { sessionId } = await Promise.resolve(context.params);
  const result = await getSessionResultById(sessionId);

  if (!result) {
    notFound();
  }

  return <ResultsExperience result={result} />;
}
