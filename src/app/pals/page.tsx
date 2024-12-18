import React from "react";
import ReferralSystem from "./ReferralSystem";

const Page = () => {
  return (
    <div className="p-4">
      <h1 className="mb-2 text-[32px] font-bold text-white">Друзья</h1>
      <p className="mb-[24px] text-gray-400">
        Приглашай друзей и зарабатывайте больше вместе
      </p>
      <ReferralSystem />
    </div>
  );
};

export default Page;
