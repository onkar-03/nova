import prisma from '../lib/db';

const Page = async () => {
  const users = await prisma.user.findMany();
  const posts = await prisma.post.findMany();

  return (
    <div>
      {JSON.stringify(users, null, 2)} {JSON.stringify(posts, null, 2)}
    </div>
  );
};

export default Page;
