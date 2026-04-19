import { notFound } from 'next/navigation';

import { ResultsExperience } from '@/components/results/ResultsExperience';
import { getSessionResultById, getTypeDistributionSummary } from '@/lib/server/session-service';

type ParamsContext = {
  params: { sessionId: string } | Promise<{ sessionId: string }>;
};

export default async function ResultsPage(context: ParamsContext) {
  const { sessionId } = await Promise.resolve(context.params);
  const [result, socialProof] = await Promise.all([
    getSessionResultById(sessionId),
    getTypeDistributionSummary(7),
  ]);

  if (!result) {
    notFound();
  }

  return <ResultsExperience result={result} sessionId={sessionId} socialProof={socialProof} />;
}
