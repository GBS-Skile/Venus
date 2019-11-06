import { PlatformAdapter } from '../chat';
import { scenarios } from '../chat/scenario';
import config from '../config';

export class StoryForest extends PlatformAdapter {
  constructor() {
    super(config.nativePlatform);
  }

  async dialogueConfig(tag, platformUser) {
    if (!tag) {
      return await super.dialogueConfig(tag, platformUser);
    } else {
      let scenario;
      try {
        scenario = /^(.+?)(?:\..+)$/.exec(tag)[1];
        if (!(scenario in scenarios)) throw new TypeError();
        return {
          initialState: 'Default',
          timeout: Infinity,
          scenario,
        };
      } catch (e) {
        if (e instanceof TypeError) {
          const err = Error(`Scenario "${scenario}" does not exist.`);
          err.name = 'ScenarioNotExist';
          throw err;
        } else throw e;
      }
    }
  }
}