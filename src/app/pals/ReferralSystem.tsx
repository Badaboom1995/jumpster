"use client";

import React, { useState } from "react";
import Button from "@/components/Button";
import Curtain from "@/components/Curtain";
import useGetUser from "@/hooks/api/useGetUser";
import { useQuery } from "react-query";

interface Referral {
  id: string;
  username: string;
  hourlyIncome: number;
  balance: number;
}

const ReferralSystem = () => {
  const { user } = useGetUser();
  const [copied, setCopied] = useState(false);
  const [showCurtain, setShowCurtain] = useState(false);

  const referralLink = `https://t.me/Jumpster_bot?start=${user?.id}`;
  const referrals = [];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateBonusIncome = (hourlyIncome: number) => {
    return (hourlyIncome * 0.2).toFixed(2);
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col justify-between">
      <div className="space-y-6">
        {/* Referrals List */}
        <div className="space-y-4">
          {referrals?.length === 0 && (
            <p className="text-gray-400">У вас пока нет приглашенных друзей</p>
          )}
          {referrals?.map((referral) => (
            <div
              key={referral.id}
              className="flex items-center justify-between rounded-lg bg-background-dark p-4"
            >
              <div>
                <h3 className="font-semibold">{referral.username}</h3>
                <p className="text-sm text-gray-400">
                  Balance: ${referral.balance.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">
                  Hourly Income: ${referral.hourlyIncome.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-400">
                  Your Bonus: ${calculateBonusIncome(referral.hourlyIncome)}/hr
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button at Bottom */}
      <div className="mt-auto pb-[40px] pt-4">
        <Button onClick={() => setShowCurtain(true)}>Пригласить друга</Button>
      </div>

      {/* Curtain with Referral Link */}
      <Curtain isOpen={showCurtain} onClose={() => setShowCurtain(false)}>
        <div className="p-4">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Приглашение в команду
          </h2>
          <div className="mb-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="w-full rounded bg-background-light p-3 text-sm text-white"
            />
          </div>
          <Button onClick={copyToClipboard} className="w-full">
            {copied ? "Скопировано!" : "Копировать ссылку"}
          </Button>
          <p className="mt-4 text-center text-sm text-gray-400">
            Отправь эту ссылку друзьям и зарабатывай 20% от их дохода!
          </p>
        </div>
      </Curtain>
    </div>
  );
};

export default ReferralSystem;
