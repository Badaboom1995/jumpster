import React from 'react';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge'
import Image from "next/image";

interface ButtonProps {
    children: React.ReactNode;
    type?: 'submit' | 'button';
    variant?: 'primary' | 'secondary';
    iconRight?: React.ReactNode;
    iconLeft?: React.ReactNode;
    className?: string;
    isLoading?: boolean;
    loaderText?: string;
    loaderIcon?: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
    children,
    type = 'button',
    variant = 'primary',
    iconRight,
    iconLeft,
    className,
    isLoading = false,
    loaderText,
    loaderIcon,
    disabled = false,
    onClick,
}) => {
    const specificClass = (variant: string) => classNames({
        'bg-primary active:bg-primary-dark transition': variant === 'primary',
        'bg-white': variant === 'secondary',
    })
    const buttonClass = twMerge(
        'rounded-[12px] text-black text-[16px] p-[12px] w-full flex justify-center font-',
        specificClass(variant),
        className
    );

    return (
        <button
            type={type as "button" | "submit"}
            className={buttonClass}
            disabled={disabled || isLoading}
            onClick={onClick}
        >
            <span className='flex gap-[8px] font-[600] items-center'>
                { iconLeft && <Image src={iconLeft as any} alt='icon'/>}
                {!isLoading && children}
            </span>
        </button>
    );
};

export default Button;