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

const getRank = (experience: number) => {
    if(experience < 100) return 1
    if(experience < 300) return 2
    if(experience < 600) return 3
    if(experience < 1000) return 4
    if(experience < 2000) return 5
    if(experience < 3500) return 6
    if(experience < 5500) return 7
    if(experience < 8000) return 8
    if(experience < 12000) return 9
    if(experience < 20000) return 10
    return 11
}
// Move to API and populate with rank
const useGetUser = (refetchOnMount?:any, onSuccess?: (data: User) => void): GetUserResponse => {
   const lp = useLaunchParams();
   const userID = lp.initData?.user?.id;
   const username = lp.initData?.user?.username;
   const {data, isLoading, isFetching, refetch} = useQuery({
       queryKey: ['user'],
       staleTime: 0,
       queryFn: async () => {
              const {data, error} = await supabase
                .from('users')
                .select(`*, user_parameters(name, value, recovery_rate, updated_at, max_value)`)
                .eq('telegram_id', userID)
                .single()
              if (error) {
                throw new Error(error.message)
              }
              // @ts-ignore
              return {
                  ...data,
                  rank: getRank(data.experience),
                  user_parameters: data.user_parameters.reduce((acc, item) => {
                    return {
                        ...acc,
                        [item.name]: {
                            value: item.value,
                            recovery_rate: item.recovery_rate,
                            last_update: item.updated_at,
                            max_value: item.max_value}
                        }
                  }, {})}
       },
       retry: false,
       refetchOnMount: refetchOnMount,
       enabled: !!userID,
       onSuccess: onSuccess || undefined,
       onError: async (error) => {
           if(!userID) return
           await createUser(userID, username)
           window.location.reload()
       }
   })

    return {
       // TODO: update User type, now ranked is not included
       user: data as User,
       isUserLoading: isLoading,
       isUserFetching: isFetching
    }
};

export default useGetUser;