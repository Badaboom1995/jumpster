"use client";
import React from "react";
import usePathCheck from "@/hooks/usePathCheck";
import Image from "next/image";
import homeIcon from "@/app/_assets/icons/Home.svg";
import homeOutlineIcon from "@/app/_assets/icons/HomeOutlined.svg";
import earnIcon from "@/app/_assets/icons/DollarCoin.svg";
import earnOutlineIcon from "@/app/_assets/icons/DollarCoinOutlined.svg";
import friendsIcon from "@/app/_assets/icons/People.svg";
import friendsOutlineIcon from "@/app/_assets/icons/PeopleOutlined.svg";
import barbel from "@/app/_assets/icons/Barbell-1.svg";
import barbelOutline from "@/app/_assets/icons/Barbell.svg";
import crownIcon from "@/app/_assets/icons/crown.svg";
import crownOutlineIcon from "@/app/_assets/icons/crown-1.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clickSound from "@/app/_assets/audio/click.wav";
import { useSound } from "@/hooks/useSound";

const Navitem = ({
  children,
  src,
  href,
}: {
  children: string;
  src: string;
  href: string;
}) => {
  const { playSound } = useSound(clickSound);
  const handleClick = () => {
    playSound();
  };

  return (
    <Link href={href} onClick={handleClick}>
      <li className="flex h-[50px] flex-col items-center justify-between gap-[4px] rounded-[12px] px-[8px] py-[4px] transition active:bg-background">
        <Image
          src={src}
          width={24}
          height={24}
          alt="menu item"
          className="max-h-[24px] min-h-[24px]"
        />
        <p className="text-[12px] text-white">{children}</p>
      </li>
    </Link>
  );
};

const Footer = () => {
  const visible = usePathCheck("/jump-flow");
  const pathname = usePathname();
  const checkIfActive = (path: string) => {
    if (pathname === path) {
      return true;
    }
  };

  return (
    <div
      className={`fixed bottom-[0] left-1/2 z-10 w-full max-w-[500px] -translate-x-1/2 bg-background-dark px-[12px] py-[8px] pb-[32px] ${!visible && "hidden"}`}
    >
      <ul className="flex w-full justify-between">
        <Navitem
          href="/"
          src={
            !checkIfActive("/") ? (homeIcon as any) : (homeOutlineIcon as any)
          }
        >
          Главная
        </Navitem>
        <Navitem
          href="/quests"
          src={
            !checkIfActive("/quests")
              ? (earnIcon as any)
              : (earnOutlineIcon as any)
          }
        >
          Доход
        </Navitem>
        <Navitem
          href="/leaderboard"
          src={
            !checkIfActive("/leaderboard")
              ? (crownOutlineIcon as any)
              : (crownIcon as any)
          }
        >
          Ранг
        </Navitem>
        <Navitem
          href="/earn"
          src={
            !checkIfActive("/earn") ? (barbel as any) : (barbelOutline as any)
          }
        >
          Фарминг
        </Navitem>
        <Navitem
          href="/pals"
          src={
            !checkIfActive("/pals")
              ? (friendsIcon as any)
              : (friendsOutlineIcon as any)
          }
        >
          Друзья
        </Navitem>
        {/* <Navitem
          href="/wallet"
          src={
            !checkIfActive("/wallet")
              ? (walletIcon as any)
              : (walletOutlineIcon as any)
          }
        >
          Кошелек
        </Navitem> */}
      </ul>
    </div>
  );
};

export default Footer;
