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
import walletIcon from "@/app/_assets/icons/Wallet.svg";
import walletOutlineIcon from "@/app/_assets/icons/WalletOutlined.svg";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Navitem = ({
  children,
  src,
  href,
}: {
  children: string;
  src: string;
  href: string;
}) => {
  return (
    <Link href={href}>
      <li className="flex h-[50px] flex-col items-center gap-[4px] rounded-[12px] px-[12px] py-[4px] transition active:bg-background">
        <Image src={src} width={24} height={24} alt="menu item" />
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
      className={`fixed bottom-[0px] left-1/2 z-10 w-full max-w-[500px] -translate-x-1/2 bg-background-dark px-[12px] py-[8px] pb-[12px] ${!visible && "hidden"}`}
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
          href="/earn"
          src={
            !checkIfActive("/earn")
              ? (earnIcon as any)
              : (earnOutlineIcon as any)
          }
        >
          Доход
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
        <Navitem
          href="/wallet"
          src={
            !checkIfActive("/wallet")
              ? (walletIcon as any)
              : (walletOutlineIcon as any)
          }
        >
          Кошелек
        </Navitem>
      </ul>
    </div>
  );
};

export default Footer;
