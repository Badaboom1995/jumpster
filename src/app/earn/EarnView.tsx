"use client";
import React, { useState } from "react";
import Image from "next/image";
import medal from "@/app/_assets/images/medal.png";
import muscle from "@/app/_assets/icons/muscle3D.png";
import dumbbel from "@/app/_assets/icons/dumbbel3D.png";
import pill from "@/app/_assets/icons/pill3D.png";
import youtube from "@/app/_assets/icons/youtube3D.png";
import { supabase } from "@/components/Root/Root";
import { useQuery, useQueryClient } from "react-query";
import { twMerge } from "tailwind-merge";
import useGetUser from "@/hooks/api/useGetUser";
import check from "@/app/_assets/icons/check.svg";
import Modal from "@/components/Modal";
import Tabs from "@/components/Tabs";

const thumbnailsMap = {
  medal,
  muscle,
  dumbbel,
  pill,
  youtube,
};

const Card = ({
  id,
  title,
  icon,
  income,
  cost,
  isBought,
  user_id,
  setIsOpen,
}) => {
  const [isDone, setIsDone] = useState(isBought);
  const { user } = useGetUser();
  // @ts-ignore
  const insuficientCoins = user?.user_parameters?.coins.value < cost;

  return (
    <div className="flex items-center gap-[12px] rounded-[8px] bg-background px-2 py-2 pr-4">
      <Image className="h-[60px] w-[60px]" src={thumbnailsMap[icon]} alt="" />
      <div className="flex w-full items-center justify-between text-white">
        <div>
          <h2 className="mb-[4px] text-[16px] font-medium">{title}</h2>
          <p className="text-gray-400">+{income} 🟡 в час</p>
        </div>
        <button
          onClick={() => setIsOpen(id)}
          disabled={insuficientCoins || isDone}
          className={twMerge(
            "background-light flex flex-col rounded-[8px] border border-background-light px-3 py-2 transition active:bg-background-light",
            isDone || insuficientCoins ? "opacity-30 active:bg-background" : "",
          )}
        >
          {/*<button>Купить</button>*/}
          <span>
            {isDone ? (
              <Image className="w-[16px]" src={check} alt={"check"} />
            ) : (
              `🟡 ${cost}`
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

const EarnView = () => {
  const { user } = useGetUser();
  const [isOpen, setIsOpen] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const buy = async (cardId, userId, cost) => {
    const { data, error } = await supabase.from("user_cards").insert([
      {
        user_id: userId,
        card_id: cardId,
      },
    ]);
    await supabase
      .from("user_parameters")
      .update({
        // @ts-ignore
        value: user?.user_parameters.coins.value - cost,
      })
      .eq("user_id", userId)
      .eq("name", "coins");

    if (error) throw error;
    setIsOpen(null);
    await queryClient.invalidateQueries({
      queryKey: ["user_cards"],
      exact: true,
    });
    await queryClient.invalidateQueries({
      queryKey: ["user"],
      exact: true,
    });
  };

  const { data } = useQuery({
    queryKey: ["earn_cards"],
    queryFn: async () => {
      const { data, error } = await supabase.from("earn_cards").select("*");
      if (error) throw error;
      return data;
    },
  });

  const openedCard = data?.find((card) => card.id === isOpen);

  const { data: user_cards_ids, isFetching } = useQuery({
    queryKey: ["user_cards"],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("user_cards(earn_cards(*))")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      // @ts-ignore
      return data.user_cards.map((card) => card.earn_cards.id);
    },
  });

  if (!data || !user_cards_ids) return null;

  return (
    <div className="max-h-[100vh] overflow-y-scroll px-[16px] pb-[90px] pt-[16px]">
      <div className="mb-[24px]">
        <h1 className="text-[32px] font-bold text-white">Улучшения</h1>
        <p className="mb-[24px] text-gray-300">
          Тренируйся, подписывай рекламные контракты и зарабатывай пассивно
        </p>
        <p className="mx-auto mb-[0px] w-fit rounded-[12px] px-[12px] text-center text-[32px] font-semibold text-white">
          {/*@ts-ignore*/}
          🟡 {user?.user_parameters?.coins?.value}
        </p>
      </div>
      <Modal isOpen={isOpen} setOpen={setIsOpen}>
        <div className="flex flex-col items-center">
          <Image
            className="w-[75px]"
            src={thumbnailsMap[openedCard?.thumbnail_name]}
            alt="img"
          />
          <p className="font-semiboldbold mb-[12px] text-[20px]">
            {openedCard?.name}
          </p>
          <p className="mb-[12px] text-center text-[14px]">
            Эта карта открывает доступ к новым возможностям для продвижения в
            социальных сетях!
          </p>
          <p className="mb-[24px] text-white">
            +{openedCard?.passive_income} 🟡 в час
          </p>
          <button
            onClick={() => buy(openedCard?.id, user?.id, openedCard.buy_price)}
            className="rounded-[8px] bg-white px-4 py-2 font-medium text-black"
          >
            Купить за {openedCard?.buy_price} 🟡
          </button>
        </div>
      </Modal>
      <Tabs tabs={["Медиа", "Спонсоры", "Атлет", "Снаряжение"]}>
        <div>
          <div className="flex flex-col gap-[12px]">
            {data?.map((card) =>
              isFetching ? (
                <div
                  key={card.id}
                  className="h-[76px] w-full animate-pulse rounded-[12px] bg-background"
                ></div>
              ) : (
                <Card
                  isBought={
                    true
                    // user_cards_ids && user_cards_ids?.includes(card?.id)
                  }
                  setIsOpen={setIsOpen}
                  user_id={user?.id}
                  key={card?.id}
                  id={card?.id}
                  cost={card?.buy_price || 0}
                  income={card?.passive_income || 0}
                  title={card?.name || ""}
                  icon={card?.thumbnail_name || ""}
                />
              ),
            )}
          </div>
        </div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
      </Tabs>
    </div>
  );
};

export default EarnView;
