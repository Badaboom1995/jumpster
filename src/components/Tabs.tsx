import React from "react";
import { twMerge } from "tailwind-merge";
import clickSound from "@/app/_assets/audio/click.wav";
import { useSound } from "@/hooks/useSound";
const Tabs = ({
  tabs,
  children,
}: {
  tabs: string[];
  children: React.ReactNode;
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const { playSound } = useSound(clickSound);
  return (
    <div>
      <div className="mb-[16px] flex w-full gap-[16px] overflow-y-scroll border-b border-background pb-[8px] text-[16px]">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={twMerge(
              "text-caption",
              index === activeTab ? "text-white" : "",
            )}
            onClick={() => {
              setActiveTab(index);
              playSound();
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {React.Children.toArray(children)[activeTab]}
      </div>
    </div>
  );
};

export default Tabs;
