import React from "react";
import ReferralSystem from "./ReferralSystem";

const Page = () => {
  return (
    <div className="flex h-[calc(100vh-90px)] flex-col p-[16px] pb-0">
      <h1 className="mb-2 text-[32px] font-bold text-white">Друзья</h1>
      <p className="mb-[16px] text-gray-400">
        Приглашай друзей и зарабатывайте больше вместе
      </p>
      <ReferralSystem />
    </div>
  );
};

export default Page;
