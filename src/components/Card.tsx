import React, {PropsWithChildren} from 'react';
import {twMerge} from "tailwind-merge";

type CardProps = {
    className?: string;
    isButton?: boolean;
} & PropsWithChildren

const Card = (props: CardProps ) => {
    const {children, className, isButton} = props;
    if(isButton) {
        return (
            <button className={twMerge('bg-background border border-background-light active:bg-background-light', className)}>
                {children}
            </button>
        );
    }
    return (
        <div className={twMerge('bg-background border border-background-light bg-opacity-50', className)}>
            {children}
        </div>
    );
};

export default Card;