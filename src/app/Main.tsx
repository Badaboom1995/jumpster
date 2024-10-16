'use client'
import React, {useEffect} from 'react';
import Button from "@/components/Button";
import Link from "next/link";
import play from '@/app/_assets/icons/Play.svg'
import energy from '@/app/_assets/icons/Energy.svg'
import saved from '@/app/_assets/icons/Saved.svg'
import roo from '@/app/_assets/images/roo-1.png'
import Card from "@/components/Card";
import Image from "next/image";
import useGetUser from "@/hooks/api/useGetUser";
import {useLaunchParams} from "@telegram-apps/sdk-react";
import {useSearchParams} from "next/navigation";
import {supabase} from "@/components/Root/Root";

const Main = () => {
    const searchParams = useSearchParams()
    const lp = useLaunchParams();
    const {user, isUserLoading} = useGetUser(true)

    if(isUserLoading) return <div>Loading...</div>
    return (
        <div className='w-[100vw] h-full flex flex-col p-[16px]'>
            <div className='grow flex flex-col justify-between'>
                <div>
                    <div className='mb-[32px]'>
                        <p className='w-full mb-0 text-[56px] leading-[60px] text-white text-center font-bold'>{user?.coins}</p>
                        <p className='w-full text-[20px] text-center text-slate-400'>+{user?.passive_income_per_hour} монет в час</p>
                    </div>
                    <Card className='
                        mb-[32px] flex flex-col items-center justify-center
                        text-white rounded-[24px] p-[24px]
                    '>
                        <Image className='-mt-[30px]' src={roo as any} alt='roo'/>
                        <div className='flex flex-wrap justify-between w-full'>
                            <span>Новичок</span>
                            <span>+10</span>
                            <div className='w-full rounded-full mt-[8px] border border-white p-1'>
                                <div className='w-1/12 rounded-full h-[7px] bg-white animate-glow'></div>
                            </div>
                        </div>
                    </Card></div>
                <div className='flex justify-between mb-[12px] font-bold text-white px-[8px]'>
                    <div className='flex gap-[4px]'><Image src={energy as any} alt='energy'/><span>{user?.current_energy}/{user?.max_energy}</span></div>
                    <div className='flex gap-[4px]'><Image src={saved as any} alt='boost'/><span>Буст</span></div>
                </div>
            </div>
            <Link href='/jump-flow'>
                <Button iconLeft={play as any}>Начать прыжки</Button>
            </Link>
        </div>
    );
};

export default Main;