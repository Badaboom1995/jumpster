import React, {PropsWithChildren} from 'react';
import Image from "next/image";
import medal from "@/app/_assets/images/medal.png";
import fire from "@/app/_assets/icons/Fire.svg";
import arrowUp from "@/app/_assets/icons/ArrowFatUp.svg";
import timer from "@/app/_assets/icons/Timer.svg";
import clockCountDown from "@/app/_assets/icons/ClockCountdown.svg";
import Link from "next/link";
import Button from "@/components/Button";
import gift from "@/app/_assets/icons/Gift.svg";
import {twMerge} from "tailwind-merge";
import {Title} from "@telegram-apps/telegram-ui";
import useAnimatedNumber from "@/hooks/useAnimatedNumber";
import {calculateCaloriesBurned, secondsToMinutesString} from "@/app/jump-flow/utils";
import {supabase} from "@/components/Root/Root";
import useGetUser from "@/hooks/api/useGetUser";
import {useRouter} from "next/navigation";

const StatCard = ({children, className}: PropsWithChildren & {className?: string}) => {
    return (
        <div className={twMerge('flex flex-col items-center h-fit gap-[4px] text-white bg-background rounded-[12px] py-[24px] px-[12px]', className)}>{children}</div>
    )
}

const coinsPerJump = 1;

const Reward = ({jumps, time}:{jumps: number, time: number}) => {
    const router = useRouter()
    const coinsEarned = jumps * coinsPerJump;
    const coinsEarnedAnimated = useAnimatedNumber(coinsEarned, 2, true);
    const caloriesAnimated = useAnimatedNumber(calculateCaloriesBurned(jumps, time), 2, true);
    const jumpsAnimated = useAnimatedNumber(jumps, 2, true);
    const timeAnimated = useAnimatedNumber(time, 2, true);
    const jumpsPerMinuteAnimated = useAnimatedNumber(Math.floor(jumps/time*60), 2, true);
    const {user, isUserLoading} = useGetUser()

    const addCoins = async () => {
       if(!user) return
       await supabase
            .from('Users')
            .update({coins: (user.coins || 0) + coinsEarned})
            .eq('id', user.id)
            .select()
        router.push('/?claim=true')
    }

    return (
        <div
            className='relative z-[50] w-full h-[100vh] bg-background-dark px-[12px] py-[24px] flex flex-col items-center'>
            <Image width={200} src={medal as any} alt='medal' className='mb-[32px]'/>
            <Title className='text-[24px] font-[500] text-white'>Отлично!</Title>
            <Title className='text-[48px] font-black text-white'>{coinsEarnedAnimated}</Title>
            <Title className='text-[16px] font-[400] text-caption mb-[24px]'>Монет получено</Title>
            <div className='grow w-full'>
                <div className='grid grid-cols-2 w-full gap-[4px]'>
                    <StatCard>
                        <Image src={fire as any} alt='energy' width={24} height={24}/>
                        <span className='text-[24px] font-[600]'>{caloriesAnimated}</span>
                        <span className='text-caption'>Calories</span>
                    </StatCard>
                    <StatCard>
                        <Image src={arrowUp as any} alt='energy' width={24} height={24}/>
                        <span className='text-[24px] font-[600]'>{jumpsAnimated}</span>
                        <span className='text-caption'>Jumps</span>
                    </StatCard>
                    <StatCard>
                        <Image src={timer as any} alt='energy' width={24} height={24}/>
                        <span className='text-[24px] font-[600]'>{secondsToMinutesString(timeAnimated)}</span>
                        <span className='text-caption'>Total time</span>
                    </StatCard>
                    <StatCard>
                        <Image src={clockCountDown as any} alt='energy' width={24} height={24}/>
                        <span className='text-[24px] font-[600]'>{jumpsPerMinuteAnimated}</span>
                        <span className='text-caption'>Jumps per minute</span>
                    </StatCard>
                </div>
            </div>
            <Link className='w-full' href='/?claim=true'>
                <Button onClick={addCoins} iconLeft={gift as any} variant='secondary'>
                    Забрать награду
                </Button>
            </Link>
        </div>
    );
};

export default Reward;