'use client'
import {useQuery} from "react-query";
import {supabase} from "@/components/Root/Root";
import {useLaunchParams} from "@telegram-apps/sdk-react";
import {useEffect} from "react";
import {User} from "@/database.types";

type GetUserResponse = {
    isUserLoading: boolean;
    isUserFetching: boolean;
    user: User | null;
}

const createUser = async (userID: number) => {
    const {data, error} = await supabase
        .from('Users')
        .insert([{telegram_id: userID}])
    if (error) {
        throw new Error(error.message)
    }
    return data
}

const useGetUser = (): GetUserResponse => {
   const lp = useLaunchParams();
   const userID = lp.initData?.user?.id;
   const {data, isLoading, isFetching, refetch} = useQuery({
       queryKey: ['user'],
       queryFn: async () => {
              const {data, error} = await supabase
                .from('Users')
                .select('*')
                .eq('telegram_id', userID)
                .single()
              if (error) {
                throw new Error(error.message)
              }
              return data
       },
       retry: false,
       enabled: !!userID,
       onError: async (error) => {
           if(!userID) return
           await createUser(userID)
           // refetch()
       }
   })

    return {
       user: data as User,
       isUserLoading: isLoading,
       isUserFetching: isFetching
    }
};

export default useGetUser;