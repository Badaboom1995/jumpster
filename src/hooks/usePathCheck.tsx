import React, {useEffect, useState} from 'react';
import {usePathname} from "next/navigation";

const usePathCheck = (path: string) => {
    const pathname = usePathname()
    const [visible, setVisble] = useState(true)
    useEffect(() => {
        if(pathname.includes(path)) {
            setVisble(false)
        } else {
            console.log('visible')
            setVisble(true)
        }
    }, [pathname])
    return visible
};

export default usePathCheck;