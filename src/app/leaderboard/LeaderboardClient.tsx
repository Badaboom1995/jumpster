"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/components/Root/Root";
import { useLaunchParams } from "@telegram-apps/sdk-react";

interface LeaderboardEntry {
  username: string;
  experience: number;
  rank: number;
}

export default function LeaderboardClient() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const lp = useLaunchParams();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("username, experience")
          .order("experience", { ascending: false })
          .limit(100);

        if (error) throw error;

        const rankedData = data.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

        setLeaderboardData(rankedData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [supabase]);

  if (loading) {
    return (
      <div className="mx-auto flex h-[calc(100vh-90px)] max-w-lg items-center justify-center p-4">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-90px)] max-w-lg flex-col p-4">
      <h1 className="mb-2 text-center text-2xl font-bold text-white">
        Таблица лидеров
      </h1>
      {/* Motivation text*/}
      <p className="mb-4 text-center text-[#808080]">
        Сейчас вы находитесь на{" "}
        {
          leaderboardData.find(
            (entry) => entry.username === lp.initData.user.username,
          )?.rank
        }{" "}
        месте
      </p>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {leaderboardData.map((entry, index) => (
          <div
            // @ts-ignore
            key={entry.user_id}
            className={`flex items-center justify-between rounded-lg p-4 ${
              lp.initData.user.username === entry.username
                ? "bg-background-light"
                : "bg-background"
            }`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`text-lg font-bold ${
                  entry.rank <= 3 ? "text-yellow-500" : "text-gray-400"
                }`}
              >
                #{entry.rank}
              </span>
              <span className="text-white">{entry.username} </span>
            </div>
            <div className="text-right">
              <span className="text-gray-300">
                {entry.experience.toLocaleString()} XP
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
