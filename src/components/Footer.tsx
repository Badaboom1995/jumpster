'use client';
import React from 'react';
import usePathCheck from "@/hooks/usePathCheck";
import Image from "next/image";
import homeIcon from "@/app/_assets/icons/Home.svg";
import earnIcon from "@/app/_assets/icons/DollarCoin.svg";
import friendsIcon from "@/app/_assets/icons/People.svg";
import walletIcon from "@/app/_assets/icons/Wallet.svg";

const Navitem = ({ children, src}: { children: string, src: string }) => {
    return (
        <li className='flex flex-col gap-[4px] items-center px-[12px] py-[4px] h-[50px]'>
            <Image src={src} width={24} height={24} alt='menu item'/>
            <p className='text-white text-[12px]'>{children}</p>
        </li>
    );
}

const Footer = () => {
    const visible = usePathCheck('/jump-flow')
    return (
        <div className={`relative z-10 w-full px-[12px] py-[8px] pb-[12px] ${!visible && 'hidden'}`}>
            <ul className='w-full flex flex justify-between'>
                <Navitem src={homeIcon as any}>Home</Navitem>
                <Navitem src={earnIcon as any}>Earn</Navitem>
                <Navitem src={friendsIcon as any}>Pals</Navitem>
                <Navitem src={walletIcon as any}>Wallet</Navitem>
            </ul>
        </div>
    );
};

export default Footer;