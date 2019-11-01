import { version } from '../../package.json';
import { Router } from 'express';
import jwtMiddleware from 'express-jwt';

import users from './users';

import { ActionEnum } from '../chat';
import { StoryForest } from './adapters.js';

const adapter = new StoryForest();

if (!process.env.JWT_SECRET) throw new Error("The environment variable JWT_SECRET is undefined!");
const auth = jwtMiddleware({ secret: process.env.JWT_SECRET, });

export default ({ config, db }) => {
  let api = Router();
  
  api.use('/users', users({ config, db }));
  
  api.post('/chat', auth, async ({ user, body: { utterance, tag = null } }, res) => {
    if (!utterance) {
      return res.status(400).json({ error: '`utterance` is required field.' });
    }

    res.status(200).json(
      await adapter.request(user.user, ActionEnum.SEND_TEXT, { text: utterance, tag })
    );
  });

  api.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json({ error: err.message });
    } else next();
  }); 

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
  });

	return api;
}
