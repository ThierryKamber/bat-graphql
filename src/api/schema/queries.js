/* eslint-disable no-param-reassign */
import {
  GraphQLBoolean,
  GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString,
} from 'graphql';

import types from './types';


export default (db) => {
  const Types = types(db);
  return {
    players: {
      type: new GraphQLList(Types.Player),
      args: {
        name: {
          type: GraphQLString,
        },
        uuid: {
          type: GraphQLString,
        },
        first: {
          type: GraphQLInt,
          description: 'Limits the number of results returned in the page. Defaults to 10.',
        },
        offset: {
          type: GraphQLInt,
        },
      },
      resolve(root, args) {
        const offset = args.offset || 0;
        const limit = args.first || 10;
        delete args.offset;
        delete args.first;
        return db.models.player.findAll({
          where: args, include: [db.models.ban], offset, limit,
        });
      },
    },
    player: {
      type: Types.Player,
      args: {
        uuid: {
          type: GraphQLID,
        },
        name: {
          type: GraphQLString,
        },
      },
      resolve(root, args) {
        if (args.uuid) {
          return db.models.player.findById(args.uuid);
        } if (args.name) {
          return db.models.player.findOne({
            where: { name: args.name }, include: [db.models.ban],
          });
        }
        throw new Error('Specify either uuid or name');
      },
    },
    bans: {
      type: new GraphQLList(Types.Ban),
      args: {
        banStaff: {
          type: GraphQLString,
          description: 'Only show bans by staff member nickname',
        },
        banState: {
          type: GraphQLBoolean,
          description: 'Filter by active / inactive bans',
        },
        first: {
          type: GraphQLInt,
          description: 'Limits the number of results returned in the page. Defaults to 10.',
        },
        offset: {
          type: GraphQLInt,
        },
        // TODO: alias should be the same as in types. How to filter by attributes?
        // TODO: Date range filter
      },
      resolve(root, args) {
        const offset = args.offset || 0;
        const limit = args.first || 10;
        delete args.offset;
        delete args.first;
        return db.models.ban.findAll({
          where: args, include: [db.models.player], offset, limit,
        });
      },
    },
    ban: {
      type: Types.Ban,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve(root, args) {
        return db.models.ban.findById(args.id);
      },
    },
  };
};