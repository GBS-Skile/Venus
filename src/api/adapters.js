import { PlatformAdapter } from '../chat';
import config from '../config';

export class StoryForest extends PlatformAdapter {
  constructor() {
    super(config.nativePlatform);
  }

  async dialogueConfig(tag, platformUser) {
    return (tag ?
      {
        initialState: 'Default',
        timeout: Infinity,
        scenario: 'fakeThoth',
      } : await super.dialogueConfig(tag, platformUser)
    );
  }
}