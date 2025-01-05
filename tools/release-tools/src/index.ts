import { analyzeChanges } from './utils/analyze-changes';

export { analyzeChanges } from './utils/analyze-changes';

export const analyzeChangesNow = async () => {
  const analysis = await analyzeChanges();
  console.log(analysis);
};

analyzeChangesNow();

