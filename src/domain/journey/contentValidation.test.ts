import { describe, expect, it } from 'vitest';
import { campaignJourney } from './campaignJourney';
import { getPedagogyCoverage, validateCampaignContent } from './contentValidation';

describe('campaign content validation', () => {
  it('has no content integrity errors', () => {
    expect(validateCampaignContent(campaignJourney)).toEqual([]);
  });

  it('covers the complete pedagogy loop in generated teaching chapters', () => {
    const teachingChapterIds = ['decision-engine', 'learning-protocol', 'neural-core', 'text-lab', 'context', 'block-assembly', 'language-model', 'training-console'];
    const chapters = getPedagogyCoverage(campaignJourney).filter(({ chapterId }) => teachingChapterIds.includes(chapterId));
    expect(chapters).toHaveLength(8);
    for (const chapter of chapters) expect(chapter).toMatchObject({ context: true, explanation: true, activity: true, discovery: true, fieldTest: true });
  });
});
