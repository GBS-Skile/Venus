import { PlatformAdapter } from '../chat';
import { Dialogue } from '../models';

export class Turi extends PlatformAdapter {
  constructor() {
    super("Turi");
  }

  dialogueConfig = () => ({
    initialState: 'Default',
    scenario: 'fakeThoth',
    timeout: Infinity,
  })
};

export class Beatrice extends PlatformAdapter {
  constructor() {
    super("Beatrice");
  }

  // use beatrice setting
};
