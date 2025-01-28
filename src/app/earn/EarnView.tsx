"use client";
import React, { useState } from "react";
import Image from "next/image";
import { supabase } from "@/components/Root/Root";
import { useQuery, useQueryClient } from "react-query";
import { twMerge } from "tailwind-merge";
import useGetUser from "@/hooks/api/useGetUser";
import check from "@/app/_assets/icons/check.svg";
import Modal from "@/components/Modal";
import Tabs from "@/components/Tabs";
import coin from "@/app/_assets/images/coin.png";
import clickSound from "@/app/_assets/audio/click.wav";
import successSound from "@/app/_assets/audio/special-click.wav";
import { useSound } from "@/hooks/useSound";

const Card = ({ id, title, icon, income, cost, isBought, setIsOpen }) => {
  const { user } = useGetUser();
  const { playSound } = useSound(clickSound);
  // @ts-ignore
  const insufficientCoins = user?.user_parameters?.coins.value < cost;

  return (
    <div className="flex items-center gap-[12px] rounded-[8px] bg-background p-2 pr-4">
      <Image
        className="h-[60px] w-[60px]"
        width={60}
        height={60}
        src={icon}
        alt=""
      />
      <div className="flex w-full items-center justify-between text-white">
        <div>
          <h2 className="mb-[4px] text-[16px] font-medium">{title}</h2>
          <p className="text-gray-400">
            +{income}{" "}
            <Image
              src={coin}
              width={16}
              height={16}
              alt="coin"
              className="inline"
            />{" "}
            в час
          </p>
        </div>
        <button
          onClick={() => {
            !isBought && setIsOpen(id);
            playSound();
          }}
          disabled={insufficientCoins || isBought}
          className={twMerge(
            "background-light flex flex-nowrap rounded-[8px] border px-3 py-2 transition",
            isBought
              ? "border-background-light bg-background-light"
              : "border-background-light active:bg-background-light",
            insufficientCoins ? "opacity-30" : "",
          )}
        >
          {isBought ? (
            <Image className="w-[16px]" src={check} alt={"check"} />
          ) : (
            <div className="flex items-center gap-[4px] whitespace-nowrap">
              <Image src="/coin.png" width={24} height={24} alt="coin" />
              {cost}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

const EarnView = () => {
  const { user } = useGetUser();
  const [isOpen, setIsOpen] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { playSound } = useSound(clickSound);

  const buy = async (cardId: number, userId: number, cost: number) => {
    try {
      setIsLoading(true);
      playSound();
      // Check if card is already bought
      const { data: existingCard } = await supabase
        .from("user_cards")
        .select("*")
        .eq("user_id", userId)
        .eq("card_id", cardId)
        .single();

      if (existingCard) {
        setIsOpen(null);
        return;
      }

      const { error } = await supabase.from("user_cards").insert([
        {
          user_id: userId,
          card_id: cardId,
        },
      ]);

      if (error) throw error;

      // Update user coins
      await supabase
        .from("user_parameters")
        .update({
          // @ts-ignore
          value: user?.user_parameters.coins.value - cost,
        })
        .eq("user_id", userId)
        .eq("name", "coins");

      // Update local state
      queryClient.setQueryData(["user_cards"], (oldData: number[]) => {
        return [...oldData, cardId];
      });

      queryClient.setQueryData(["user"], (oldData: any) => {
        return {
          ...oldData,
          user_parameters: {
            ...oldData.user_parameters,
            coins: {
              ...oldData.user_parameters.coins,
              value: oldData.user_parameters.coins.value - cost,
            },
          },
        };
      });
      const successAudio = new Audio(successSound);
      successAudio.play();
      setIsOpen(null);
    } catch (error) {
      console.error("Error buying card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const { data, isLoading: isCardsLoading } = useQuery({
    queryKey: ["earn_cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("earn_cards")
        .select("*")
        .order("buy_price", { ascending: true });
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
  const sponsors = data?.filter((card) => card.category === "Спонсоры");
  const athletes = data?.filter((card) => card.category === "Атлет");
  const equipment = data?.filter((card) => card.category === "Снаряжение");
  const media = data?.filter((card) => card.category === "Медиа");

  if (!data || !user_cards_ids) return null;

  return (
    <div className="max-h-[100vh] overflow-y-scroll px-[16px] pb-[90px] pt-[16px]">
      <div className="mb-[24px]">
        <h1 className="text-[32px] font-bold text-white">Фарминг</h1>
        <p className="mb-[24px] text-gray-300">
          Тренируйся, подписывай рекламные контракты и зарабатывай пассивно
        </p>
        <p className="mx-auto mb-[0px] w-fit rounded-[12px] px-[12px] text-center text-[32px] font-semibold text-white">
          <Image
            src={coin}
            width={48}
            height={48}
            alt="coin"
            className="mr-2 inline"
          />
          {/*@ts-ignore*/}
          {user?.user_parameters?.coins?.value.toLocaleString()}
        </p>
      </div>
      <Modal isOpen={isOpen} setOpen={setIsOpen}>
        <div className="flex flex-col items-center">
          <Image
            className="w-[100px]"
            src={openedCard?.icon || ""}
            width={100}
            height={100}
            alt="img"
          />
          <p className="mb-[12px] text-center text-[20px] font-semibold">
            {openedCard?.name}
          </p>
          <p className="mb-[12px] text-center text-[14px]">
            {openedCard?.description}
          </p>
          <p className="mb-[24px] text-white">
            +{openedCard?.passive_income}{" "}
            <Image
              src={coin}
              width={24}
              height={24}
              alt="coin"
              className="inline"
            />{" "}
            в час
          </p>
          <button
            // @ts-ignore
            onClick={() => buy(openedCard?.id, user?.id, openedCard.buy_price)}
            className="rounded-[8px] bg-white px-4 py-2 font-medium text-black"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <span>Покупка...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span>Купить за {openedCard?.buy_price}</span>
                <Image
                  src={coin}
                  width={24}
                  height={24}
                  alt="coin"
                  className="inline"
                />
              </div>
            )}
          </button>
        </div>
      </Modal>
      <Tabs tabs={["Медиа", "Спонсоры", "Атлет"]}>
        <div>
          <div className="flex flex-col gap-[12px]">
            {" "}
            {media?.map((card) =>
              isFetching ? (
                <div
                  key={card.id}
                  className="h-[76px] w-full animate-pulse rounded-[12px] bg-background"
                />
              ) : (
                <Card
                  key={card.id}
                  isBought={user_cards_ids?.includes(card.id)}
                  setIsOpen={setIsOpen}
                  user_id={user?.id}
                  id={card.id}
                  cost={card.buy_price || 0}
                  income={card.passive_income || 0}
                  title={card.name || ""}
                  icon={card.icon || ""}
                />
              ),
            )}
          </div>
        </div>
        <div className="flex flex-col gap-[12px]">
          {sponsors?.map((card) =>
            isFetching ? (
              <div
                key={card.id}
                className="h-[76px] w-full animate-pulse rounded-[12px] bg-background"
              />
            ) : (
              <Card
                key={card.id}
                isBought={user_cards_ids?.includes(card.id)}
                setIsOpen={setIsOpen}
                user_id={user?.id}
                id={card.id}
                cost={card.buy_price || 0}
                income={card.passive_income || 0}
                title={card.name || ""}
                icon={card.icon || ""}
              />
            ),
          )}
        </div>
        <div className="flex flex-col gap-[12px]">
          {athletes?.map((card) =>
            isFetching ? (
              <div
                key={card.id}
                className="h-[76px] w-full animate-pulse rounded-[12px] bg-background"
              />
            ) : (
              <Card
                key={card.id}
                isBought={user_cards_ids?.includes(card.id)}
                setIsOpen={setIsOpen}
                user_id={user?.id}
                id={card.id}
                cost={card.buy_price || 0}
                income={card.passive_income || 0}
                title={card.name || ""}
                icon={card.icon || ""}
              />
            ),
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default EarnView;
