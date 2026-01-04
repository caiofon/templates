import { PubSub } from 'graphql-subscriptions';
import { Context } from '../context';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    me: (_: any, __: any, { user }: Context) => user,
    
    users: async (_: any, __: any, { prisma }: Context) => {
      return prisma.user.findMany();
    },
    
    user: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return prisma.user.findUnique({ where: { id } });
    },
    
    posts: async (
      _: any,
      { limit = 10, offset = 0 }: { limit?: number; offset?: number },
      { prisma }: Context,
    ) => {
      const [posts, totalCount] = await Promise.all([
        prisma.post.findMany({
          take: limit + 1,
          skip: offset,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.post.count(),
      ]);

      const hasNextPage = posts.length > limit;
      const edges = hasNextPage ? posts.slice(0, -1) : posts;

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: edges.length > 0 ? edges[edges.length - 1].id : null,
        },
        totalCount,
      };
    },
    
    post: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      return prisma.post.findUnique({ where: { id } });
    },
  },

  Mutation: {
    createPost: async (
      _: any,
      { input }: { input: { title: string; content: string; published?: boolean } },
      { prisma, user }: Context,
    ) => {
      const post = await prisma.post.create({
        data: {
          ...input,
          authorId: user!.id,
        },
      });

      pubsub.publish('POST_CREATED', { postCreated: post });
      return post;
    },
    
    updatePost: async (
      _: any,
      { id, input }: { id: string; input: any },
      { prisma }: Context,
    ) => {
      const post = await prisma.post.update({
        where: { id },
        data: input,
      });

      pubsub.publish(`POST_UPDATED_${id}`, { postUpdated: post });
      return post;
    },
    
    deletePost: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      await prisma.post.delete({ where: { id } });
      return true;
    },
  },

  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterator(['POST_CREATED']),
    },
    postUpdated: {
      subscribe: (_: any, { id }: { id: string }) =>
        pubsub.asyncIterator([`POST_UPDATED_${id}`]),
    },
  },

  // Field resolvers with DataLoader
  User: {
    posts: async (parent: any, _: any, { loaders }: Context) => {
      return loaders.postsByAuthorLoader.load(parent.id);
    },
  },

  Post: {
    author: async (parent: any, _: any, { loaders }: Context) => {
      return loaders.userLoader.load(parent.authorId);
    },
  },
};
