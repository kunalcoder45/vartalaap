
import UserProfilePostsPage from '../../../components/UserProfilePostsPage'; // Correct relative path

interface UserProfilePageProps {
  params: {
    uid: string;
  };
}

export default function Page({ params }: UserProfilePageProps) {
  const { uid } = params;

  return <UserProfilePostsPage uid={uid} />;
}