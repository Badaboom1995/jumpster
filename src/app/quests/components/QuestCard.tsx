import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
// Icons
import xIcon from "@/app/_assets/icons/x.png";
import frendsIcon from "@/app/_assets/icons/frens.png";
import telegramIcon from "@/app/_assets/icons/telegram.png";
import youtubeIcon from "@/app/_assets/icons/youtube.png";
import jumpsterIcon from "@/app/_assets/icons/roo.png";
import coinIcon from "@/app/_assets/images/coin.png";
import toast from "react-hot-toast";
import { useSound } from "@/hooks/useSound";
import clickSound from "@/app/_assets/audio/click.wav";
import successSound from "@/app/_assets/audio/special-click.wav";

export type Quest = {
  id: number;
  title: string;
  points: number;
  quest_type: "twitter" | "telegram" | "discord";
  link?: string;
  active: boolean;
  created_at: string;
};

const iconMap = {
  x: xIcon,
  telegram: telegramIcon,
  youtube: youtubeIcon,
  jumpster: jumpsterIcon,
  friends: frendsIcon,
};

type QuestCardProps = {
  quest: Quest;
  onComplete: (quest: Quest) => void;
  icon?: string;
  startFirework: (event: React.MouseEvent) => void;
};

export const QuestCard = ({
  quest,
  onComplete,
  icon,
  startFirework,
}: QuestCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReadyToClaim, setIsReadyToClaim] = useState(false);
  const { playSound } = useSound(clickSound);
  const { playSound: playSuccessSound } = useSound(successSound);

  const handleComplete = async () => {
    playSound();
    if (isReadyToClaim) return;

    setIsLoading(true);

    // Open link first
    if (quest.link) {
      window.open(quest.link, "_blank");
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsReadyToClaim(true);
  };

  const handleClaim = async (event: React.MouseEvent) => {
    playSuccessSound();
    startFirework(event);
    await onComplete(quest);
    toast.success(`Получено ${quest.points.toLocaleString()} монет!`, {
      duration: 3000,
      position: "top-center",
      style: {
        background: "#1F2937",
        color: "#fff",
        border: "1px solid #374151",
      },
    });
  };

  return (
    <div className="flex items-center gap-[12px] rounded-[8px] bg-background px-2 py-3">
      <Image
        src={icon || iconMap[quest.quest_type] || telegramIcon}
        alt={quest.quest_type}
        width={50}
        height={50}
        className="min-w-[40px]"
      />
      <div className="flex w-full items-center justify-between">
        <div className="pr-[8px]">
          <h3 className="mb-0 max-w-[200px] truncate text-[14px] font-medium text-white">
            {quest.title}
          </h3>
          <p className="flex items-center gap-[4px] text-[14px] text-gray-400">
            +{quest.points.toLocaleString()}
            <Image src={coinIcon} alt="coin" width={20} height={20} />
          </p>
        </div>
        <button
          onClick={isReadyToClaim ? handleClaim : handleComplete}
          disabled={isLoading}
          className={twMerge(
            "flex flex-col items-center rounded-[12px] border px-3 py-2 text-[15px]",
            isReadyToClaim
              ? "border-primary bg-primary text-black"
              : "border-background-light text-white hover:bg-background-light",
            isLoading ? "opacity-70" : "",
          )}
        >
          <span>
            {isLoading ? "..." : isReadyToClaim ? "Забрать" : "Старт"}
          </span>
        </button>
      </div>
    </div>
  );
};
