'use client'
import {useQuery} from "react-query";
import {supabase} from "@/components/Root/Root";
import {useLaunchParams} from "@telegram-apps/sdk-react";
import {User} from "@/database.types";

type GetUserResponse = {
    isUserLoading: boolean;
    isUserFetching: boolean;
    user: User | null;
}

const createUser = async (userID: number, username = 'unknown') => {
    const {data, error} = await supabase
        .from('Users')
        .insert([{telegram_id: userID, username}])
    if (error) {
        throw new Error(error.message)
    }
    return data
}

const useGetUser = (): GetUserResponse => {
   const lp = useLaunchParams();
   const userID = lp.initData?.user?.id;
   const username = lp.initData?.user?.username;
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
           await createUser(userID, username)
           window.location.reload()
       }
   })

    return {
       user: data as User,
       isUserLoading: isLoading,
       isUserFetching: isFetching
    }
};

export default useGetUser;