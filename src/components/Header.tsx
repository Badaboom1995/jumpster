'use client';
import React from 'react';
import usePathCheck from "@/hooks/usePathCheck";
import Card from "@/components/Card";
import Image from "next/image";
import fire from "@/app/_assets/icons/Fire.svg";
import basket from "@/app/_assets/icons/Basket.svg";
import useGetUser from "@/hooks/api/useGetUser";

const Header = () => {
    const {user} = useGetUser()
    const visible = usePathCheck('/jump-flow')
    return (
        <div className={`${!visible && 'hidden'} flex justify-between items-start p-[16px] pt-[24px] font-bold`}>
            <div className='flex gap-[8px]'>
                <Card className='rounded-[12px] px-[12px] py-[4px] text-white'>BA</Card>
                <div className='bg-white rounded-[12px] px-[12px] py-[4px] font-boldtext-black flex gap-[4px] items-center'><Image className='w-[20px]' src={basket as any} alt='basket'/>Магазин</div>
            </div>
            <div className='rounded-[12px] px-[8px] py-[4px] text-white flex items-center gap-[4px]'><Image src={fire as any} alt='basket'/> {user?.streak_counter} дней</div>
        </div>
    );
};

export default Header;