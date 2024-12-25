"use client";
import React from "react";
import { BoostersList } from "@/components/Boosters/BoostersList";
import useGetUser from "@/hooks/api/useGetUser";

export default function BoostersPage() {
  const { user, isUserLoading } = useGetUser(false);

  if (isUserLoading || !user) return null;

  return (
    <div className="flex h-[100vh] w-full flex-col overflow-y-scroll px-[16px] py-[24px] pb-[100px]">
      <BoostersList userId={user.id.toString()} />
    </div>
  );
}
