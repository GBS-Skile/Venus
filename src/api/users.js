import { Router } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/user';
import PlatformUser from '../models/platformUser';

export default ({ config, db }) => {
  let users = Router();

  users.param('user', async (req, res, next, id) => {
    const user = await User.findOne({ username: id });
    if (user) req.user = user;
    else res.status(404).json({ error: `User ${id} not found` });
    next();
  });

  users.post('/', ({ body: { username, password, context = {} } }, res) => {
    PlatformUser.registerNative(username, password, context).then(
      () => res.sendStatus(204)
    ).catch(
      err => {
        if (err.name === 'MongoError' && err.code === 11000) {
          res.status(409).json({ error: err.errmsg });
        } else {
          res.status(400).json({ error: err.message || err._message || err.name });
        }
      }
    );
  });
  
  users.post('/:user/token', ({ user, body: { password } }, res) => {
    User.auth(user.username, password).then(success => {
      if (success) {
        if (!process.env.JWT_SECRET) {
          throw new Error("The environment variable JWT_SECRET is undefined.");
        }

        const token = jwt.sign(
          { user: user.username },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        res.status(201).send(token);
      } else res.status(403).json({ error: 'Authorization failed' });
    });
  });

  return users;
}

// resource({
//   id: 'user',
	/** For requests with an `id`, you can auto-load the entity.
	 *  Errors terminate the request, success sets `req[id] = data`.
	 */
	// load(req, id, callback) {
	// 	let facet = facets.find( facet => facet.id===id ),
	// 		err = facet ? null : 'Not found';
	// 	callback(err, facet);
	// },

	/** GET / - List all entities */
	// index({ params }, res) {
	// 	res.json(facets);
	// },

	/** POST / - Create a new entity */


	/** GET /:id - Return a given entity */
	// read({ facet }, res) {
	// 	res.json(facet);
	// },

	/** PUT /:id - Update a given entity */
	// update({ facet, body }, res) {
	// 	for (let key in body) {
	// 		if (key!=='id') {
	// 			facet[key] = body[key];
	// 		}
	// 	}
	// 	res.sendStatus(204);
	// },

	/** DELETE /:id - Delete a given entity */
	// delete({ facet }, res) {
	// 	facets.splice(facets.indexOf(facet), 1);
	// 	res.sendStatus(204);
	// }
// });
