import { OKT } from 'koalanlp/API';
import { initialize } from 'koalanlp/Util';
import { Tagger } from 'koalanlp/proc';

let tagger = null;

export async function getOktTagger() {
  if (!tagger) {
    await initialize({'packages': {OKT: '2.0.6'}, 'verbose': true});
    tagger = new Tagger(OKT);
  }

  return tagger;
}

getOktTagger().then(() => console.log('Okt Tagger loaded!'));
