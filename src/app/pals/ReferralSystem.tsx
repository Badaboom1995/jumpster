"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/Button";
import Curtain from "@/components/Curtain";
import useGetUser from "@/hooks/api/useGetUser";
import { useQuery, useQueries } from "react-query";
import { supabase } from "@/components/Root/Root";
import { getRankData } from "@/utils";
import Image from "next/image";
import coin from "@/app/_assets/images/coin.png";
import { PostgrestResponse } from "@supabase/supabase-js";
import successSound from "@/app/_assets/audio/special-click.wav";
import { useUtils } from "@telegram-apps/sdk-react";

interface Referral {
  id: string;
  username: string;
  hourlyIncome: number;
  balance: number;
}

interface ReferralData {
  data?: any[];
  error?: any;
}

interface PassiveIncomeResponse {
  totalPassiveIncome: number;
}

const ReferralGuide = () => {
  return (
    <div className="rounded-lg bg-background-dark pt-[24px]">
      <div className="relative flex flex-col gap-y-6">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-[16px] h-[calc(100%-56px)] w-[2px] bg-white" />

        <div className="flex items-start gap-4">
          <div className="relative z-10 ml-[8px] mt-[4px] h-4 w-4 rounded-full border-2 border-background-dark bg-white" />
          <div>
            <p className="text-[16px] font-medium text-white">
              Поделись ссылкой
            </p>
            <p className="text-[13px] text-gray-400">
              Получи дополнительный бустер
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="relative z-10 ml-[8px] mt-[4px] h-4 w-4 rounded-full border-2 border-background-dark bg-white" />
          <div>
            <p className="text-[16px] font-medium text-white">
              Друзья присоединяются к Jumpster
            </p>
            <p className="text-[13px] text-gray-400">
              И начинают зарабатывать очки
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="relative z-10 ml-[8px] mt-[4px] h-4 w-4 rounded-full border-2 border-background-dark bg-white" />
          <div>
            <p className="text-[16px] font-medium text-white">
              Зарабатывай 10% от рефералов
            </p>
            <p className="text-[13px] text-gray-400">
              Плюс 2.5% от их рефералов
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReferralSystem = () => {
  const utils = useUtils();
  const { user } = useGetUser();
  const [copied, setCopied] = useState(false);
  const [showCurtain, setShowCurtain] = useState(false);

  const referralLink = `https://t.me/Jumpster_bot?start=${user?.id}`;
  // get referrals and referrer with reffered user field
  const { data: referrals, isLoading: referralsLoading } = useQuery<
    PostgrestResponse<any>
  >({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      return supabase
        .from("referrals")
        .select(
          "*, users!referrals_referred_user_id_fkey(id, username, experience, user_parameters(*))",
        )
        .eq("referrer_id", user?.id);
    },
    enabled: !!user?.id,
  });

  const { data: referrer, isLoading: isReferrerLoading } = useQuery<
    PostgrestResponse<any>
  >({
    queryKey: ["referrer", user?.id],
    queryFn: async () => {
      return supabase
        .from("referrals")
        .select(
          "users!referrals_referrer_id_fkey(id, username, experience, user_parameters(*))",
        )
        .eq("referred_user_id", user?.id);
    },
    enabled: !!user?.id,
  });

  const linkedUsers = [...(referrals?.data ?? []), ...(referrer?.data ?? [])];

  // Fetch passive income for each referral
  const passiveIncomeQueries = useQueries(
    linkedUsers?.map((referral) => ({
      queryKey: ["passiveIncome", referral.users.id],
      queryFn: async () => {
        const response = await fetch(
          `/api/getPassiveCoins?user_id=${referral.users.id}`,
        );
        const data: PassiveIncomeResponse = await response.json();
        return data.totalPassiveIncome;
      },
      enabled: !!referrals?.data && !!referrer?.data,
    })) ?? [],
  );

  const calculateBonusIncome = (hourlyIncome: number) => {
    return Math.ceil(hourlyIncome * 0.2);
  };

  const shareLink = () => {
    utils && utils.shareURL(referralLink);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    const audio = new Audio(successSound);
    audio.play();
  };

  const getAvatarByExp = (exp: number) => {
    const rankData = getRankData(exp);
    return (
      <div className="h-[50px] w-[50px] overflow-hidden rounded-full border-2 border-background">
        <Image
          className="translate-x-[-37px] translate-y-[-5px]"
          src={rankData.url}
          alt={rankData.name}
          width={120}
          height={120}
        />
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-230px)] flex-col">
      {/* Scrollable Container with Shadows */}
      <div className="relative h-0 grow">
        {/* Top Shadow */}
        <div className="pointer-events-none absolute top-0 z-10 h-4 w-full bg-gradient-to-b from-background-dark to-transparent" />

        {/* Scrollable Content */}
        <div className="h-full overflow-y-auto pt-[4px]">
          {referralsLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="h-[30px] w-[30px] animate-bounce rounded-full bg-white" />
            </div>
          )}
          <div className="space-y-4">
            {(!linkedUsers ||
              (linkedUsers.length === 0 && !referralsLoading)) && (
              <ReferralGuide />
            )}
            {linkedUsers?.map((referral, index) => (
              <div
                key={referral.id}
                className="mb-[12px] flex items-center justify-between rounded-lg bg-background-dark"
              >
                <div className="flex w-full items-center gap-4">
                  {getAvatarByExp(referral.users.experience)}
                  <div className="grow">
                    <h3 className="mb-[4px] text-[16px] font-semibold text-white">
                      {referral.users.username}
                    </h3>

                    <p className="flex items-center gap-1 text-[12px] text-sm text-white">
                      <span>
                        {getRankData(referral.users.experience).name}&nbsp;
                      </span>
                      <span className="inline-block h-[4px] w-[4px] rounded-full bg-white" />
                      <div className="flex items-center gap-1">
                        <Image src={coin} alt="coin" width={20} height={20} />
                        {referral.users.user_parameters
                          .find((item) => item.name === "coins")
                          ?.value.toLocaleString()}
                      </div>
                    </p>
                  </div>
                  <p className="flex items-center gap-1 text-[20px] font-bold text-white">
                    {passiveIncomeQueries[index]?.data ? (
                      <div className="flex items-center gap-1">
                        +
                        {calculateBonusIncome(passiveIncomeQueries[index].data)}
                        <Image src={coin} alt="coin" width={30} height={30} />
                      </div>
                    ) : (
                      <div className="h-[30px] w-[60px] animate-pulse rounded-[12px] bg-background-light" />
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom Shadow */}
        <div className="pointer-events-none absolute bottom-0 z-10 h-4 w-full bg-gradient-to-t from-background-dark to-transparent" />
      </div>

      {/* Button at Bottom */}
      <div className="mt-2 px-[4px]">
        <Button onClick={shareLink} className="w-full">
          Пригласить друга
        </Button>
      </div>

      {/* Curtain component remains unchanged */}
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
            Отправь эту ссылку друзьям и зарабатывай 10% от их дохода!
          </p>
        </div>
      </Curtain>
    </div>
  );
};

export default ReferralSystem;
