import { PlatformAdapter } from '../chat';
import { Dialogue } from '../models';

export class Turi extends PlatformAdapter {
  constructor() {
    super("Turi");
  }

  dialogueConfig() {
    return ({
      initialState: 'Default',
      scenario: 'fakeThoth',
      timeout: 60 * 60 * 1000,
    });
  }
};

export class Beatrice extends PlatformAdapter {
  constructor() {
    super("Beatrice");
  }

  // use beatrice setting
};
