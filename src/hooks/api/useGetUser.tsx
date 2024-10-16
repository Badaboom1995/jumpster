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
        .from('users')
        .insert([{telegram_id: userID, username}])
    if (error) {
        console.log(error)
        throw new Error(error.message)
    }
    return data
}

const useGetUser = (refetchOnMount?:any): GetUserResponse => {
   const lp = useLaunchParams();
   const userID = lp.initData?.user?.id;
   const username = lp.initData?.user?.username;
   const {data, isLoading, isFetching, refetch} = useQuery({
       queryKey: ['user'],
       staleTime: 0,
       queryFn: async () => {
           console.log('fetching user')
              const {data, error} = await supabase
                .from('users')
                .select(`*, user_parameters(name, value, recovery_rate, updated_at)`)
                .eq('telegram_id', userID)
                .single()
              if (error) {
                throw new Error(error.message)
              }
              // @ts-ignore
              return {...data, user_parameters: data.user_parameters.reduce((acc, item) => {
                  return {...acc, [item.name]: {value: item.value, recovery_rate: item.recovery_rate, last_update: item.updated_at}}
                }, {})}
       },
       retry: false,
       refetchOnMount: refetchOnMount,
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