import React, { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export const Title = ({
  children,
  className,
}: PropsWithChildren & { className?: string }) => {
  return (
    <p
      className={twMerge(
        "w-full text-center text-[40px] font-bold leading-[48px] text-white",
        className,
      )}
    >
      {children}
    </p>
  );
};
