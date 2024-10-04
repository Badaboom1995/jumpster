'use client'
import React, {useEffect} from 'react';
import {useLaunchParams} from "@telegram-apps/sdk-react";
import { createClient } from '@supabase/supabase-js'
import JumpFlow from "@/components/JumpFlow/JumpFlow";
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
        <div className='w-[390px] h-[844px] rounded-[16px] bg-slate-800 border border-slate-900 my-[24px] overflow-hidden m-auto'>
            <JumpFlow />
        </div>
    );
};

export default Main;