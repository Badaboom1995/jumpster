'use client';
import React from 'react';
import usePathCheck from "@/hooks/usePathCheck";
import Card from "@/components/Card";
import Image from "next/image";
import fire from "@/app/_assets/icons/Fire.svg";
import basket from "@/app/_assets/icons/Basket.svg";

const Header = () => {
    const visible = usePathCheck('/jump-flow')
    return (
        <div className={`${!visible && 'hidden'} flex justify-between p-[12px] font-bold`}>
            <div className='flex gap-[8px]'>
                <Card className='rounded-[12px] px-[12px] py-[4px] text-white'>AB</Card>
                <Card className='rounded-[12px] px-[12px] py-[4px] text-white flex gap-[4px]'><Image src={basket as string} alt='basket'/> Shop</Card>
            </div>
            <div className='rounded-[12px] px-[8px] py-[4px] text-white flex items-center gap-[4px]'><Image src={fire as string} alt='basket'/> 12 days</div>
        </div>
    );
};

export default Header;