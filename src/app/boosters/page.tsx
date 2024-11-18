"use client";
import React from 'react';
import { BoostersList } from '@/components/Boosters/BoostersList';
import useGetUser from '@/hooks/api/useGetUser';
import Header from '@/components/Header';

export default function BoostersPage() {
  const { user, isUserLoading } = useGetUser(false);

  if (isUserLoading || !user) return null;

  return (
    <div className="flex h-[100vh] w-full flex-col px-[16px] py-[24px] overflow-y-scroll pb-[100px]">
      <BoostersList userId={user.id.toString()} />
    </div>
  );
} 