// app/users/[uid]/page.tsx
import UserProfilePostsWrapper from './UserProfilePostsWrapper';

interface PageProps {
  params: Promise<{ uid: string }>;
}

export default async function Page({ params }: PageProps) {
  // Await the params since they're now a Promise in Next.js 15
  const { uid } = await params;
  
  return <UserProfilePostsWrapper uid={uid} />;
}