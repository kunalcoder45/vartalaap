'use client';
import HomePageContent from '../components/home/homepage'; // Assuming you put homepage.tsx in 'components'

export default function Page() {
  return (
    <div className='hide-scrollbar'>
      <HomePageContent />
    </div>
  );
}