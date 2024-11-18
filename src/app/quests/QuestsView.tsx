"use client";
import React, { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { supabase } from "@/components/Root/Root";
import useGetUser from "@/hooks/api/useGetUser";
import { QuestCard, type Quest } from "./components/QuestCard";
import CoinsFirework, {
  CoinsFireworkRef,
} from "@/components/CoinsFirework/CoinsFirework";

const QuestsView: React.FC = () => {
  const { user } = useGetUser();
  const queryClient = useQueryClient();
  const coinsFireworkRef = useRef<CoinsFireworkRef>(null);

  // Fetch completed quest IDs first
  const { data: completedQuests } = useQuery<number[]>({
    queryKey: ["completed_quests", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_quests")
        .select("quest_id")
        .eq("user_id", user?.id);
      if (error) throw error;
      return data.map((q) => q.quest_id);
    },
  });
  const addCoins = async (coins: number) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_parameters")
      .update({ value: coins })
      .eq("user_id", user.id)
      .eq("name", "coins");

    if (error) throw error;

    queryClient.setQueryData(["user"], (oldUser: any) => {
      if (!oldUser) return oldUser;
      return {
        ...oldUser,
        user_parameters: {
          ...oldUser.user_parameters,
          coins: {
            ...oldUser.user_parameters.coins,
            value: coins,
          },
        },
      };
    });
  };
  // Fetch only uncompleted quests
  const { data: quests } = useQuery<Quest[]>({
    queryKey: ["quests", completedQuests],
    enabled: !!completedQuests,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quests")
        .select("*")
        .eq("active", true)
        .not("id", "in", `(${completedQuests?.join(",")})`);
      if (error) throw error;
      return data;
    },
  });
  // Complete quest mutation
  const completeQuestMutation = useMutation({
    mutationFn: async (quest: Quest) => {
      // Record completion
      const { error: completionError } = await supabase
        .from("user_quests")
        .insert([
          {
            user_id: user?.id,
            quest_id: quest.id,
          },
        ]);
      if (completionError) throw completionError;
      // @ts-ignore
      await addCoins(user.user_parameters.coins.value + quest.points);
    },
    onSuccess: (_, completedQuest) => {
      queryClient.setQueryData<number[]>(
        ["completed_quests", user?.id],
        (oldCompleted) => {
          return [...(oldCompleted || []), completedQuest.id];
        },
      );
    },
  });

  const handleTestFirework = (event: React.MouseEvent) => {
    coinsFireworkRef.current?.triggerAnimation(event.clientX, event.clientY);
  };
  // if (!quests) return null;

  return (
    <div className="relative px-[16px] py-[24px]">
      <CoinsFirework ref={coinsFireworkRef} />

      <h1 className="mb-2 text-[24px] font-bold text-white">Задания</h1>

      <p className="mb-[24px] text-gray-400">
        Выполняй задания и получай опыт для своего персонажа
      </p>

      <div className="flex flex-col gap-[12px]">
        {quests?.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onComplete={(quest) => completeQuestMutation.mutate(quest)}
            startFirework={handleTestFirework}
          />
        ))}
      </div>

      {!quests?.length && (
        <div className="fixed left-1/2 top-1/3 w-full -translate-x-1/2 pt-[100px] text-center text-[28px] text-caption">
          На сегодня все
        </div>
      )}
    </div>
  );
};

export default QuestsView;
