'use client'
import React, {useState} from 'react';
import { useUser } from '@/hooks/useUser';
import { useProfile } from '@/hooks/useProfile';
import Relationships from './components/relationships';
import Teams from './components/teams';

const PortalPage = () => {
  const user = useUser();
  const profile = useProfile(user?.id);

  const [selectedDependent, setSelectedDependent] = useState(null);

  console.log(user)
  console.log(profile)

  return (
    <div>
      <Relationships user={user} profile={profile} onDependentSelect={setSelectedDependent} />
      <Teams user={user} profile={profile} selectedDependent={selectedDependent} />
    </div>
  );
};

export default PortalPage;
