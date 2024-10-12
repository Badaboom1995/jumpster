'use client'
import React,{useEffect} from 'react';
import {useLaunchParams} from "@telegram-apps/sdk-react";
import { createClient } from '@supabase/supabase-js'
import Button from "@/components/Button";
import Link from "next/link";
import play from '@/app/_assets/icons/Play.svg'
import roo from '@/app/_assets/images/roo-1.png'
import Card from "@/components/Card";
import Image from "next/image";

const supabase = createClient('https://adrdxahjylqbmxomhrmi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcmR4YWhqeWxxYm14b21ocm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njc1NDAsImV4cCI6MjA0MzI0MzU0MH0.pe1KulD4qwauzZxD0PFIV0cfdnuVii12tdgUHsQsRiA')

const Main = () => {
    const lp = useLaunchParams();
    useEffect(() => {
        supabase
            .from('Users')
            .select('*')
            .eq('telegram_id', lp.initData?.user?.id)
            .then(console.log)
    }, []);

    return (
        <div className='w-[100vw] h-full flex flex-col p-[16px]'>
            <div className='grow flex flex-col justify-end'>
                <div className='mb-[48px]'>
                    <p className='w-full mb-0 text-[56px] leading-[60px] text-white text-center font-bold'>100</p>
                    <p className='w-full text-[20px] text-center text-slate-400'>+10 per hour</p>
                </div>
                <Card className='
                    mb-[32px] flex flex-col items-center justify-center
                    text-white rounded-[24px] p-[24px]
                '>
                    <Image className='-mt-[50px] scale-110' src={roo as any} alt='roo'/>
                    <p className='flex flex-wrap justify-between w-full'>
                        <span>Beginner</span>
                        <span>+10k</span>
                        <div className='w-full rounded-full mt-[8px] h-[5px] bg-white'></div>
                    </p>
                </Card>
            </div>
            <Link href='/jump-flow'>
                <Button iconLeft={play as string}>Start jumping</Button>
            </Link>
        </div>
    );
};

export default Main;