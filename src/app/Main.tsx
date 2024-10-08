'use client'
import React from 'react';
import VideoCanvas from "@/components/JumpFlow/CleanFlow";
// import {useLaunchParams} from "@telegram-apps/sdk-react";
// import { createClient } from '@supabase/supabase-js'
// import VideoCanvas from "@/components/JumpFlow/TestFlow";
// const supabase = createClient('https://adrdxahjylqbmxomhrmi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcmR4YWhqeWxxYm14b21ocm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2Njc1NDAsImV4cCI6MjA0MzI0MzU0MH0.pe1KulD4qwauzZxD0PFIV0cfdnuVii12tdgUHsQsRiA')

const Main = () => {
    // const lp = useLaunchParams();

    // useEffect(() => {
    //     supabase
    //         .from('Users')
    //         .select('*')
    //         .eq('telegram_id', lp.initData?.user?.id)
    //         .then(console.log)
    // }, []);

    return (
        <div className='w-[100vw] h-[100vh] bg-white'>
            {/*<JumpFlow />*/}
            {/*<VideoCanvas/>*/}
            <VideoCanvas />
        </div>
    );
};

export default Main;