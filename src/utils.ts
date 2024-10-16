import {supabase} from "@/components/Root/Root";

/**
 * Get the difference between two timestamps in seconds.
 * @param timestamp1 - The first timestamp as a string (ISO format).
 * @param timestamp2 - The second timestamp as a string (ISO format).
 * @returns Difference in seconds (absolute value).
 */
const getDifferenceInSeconds = (timestamp1: string, timestamp2: string): number => {
    // Convert timestamps to Date objects
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    // Get the difference in milliseconds
    const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());

    // Convert milliseconds to seconds
    return Math.floor(diffInMilliseconds / 1000);
};


export const addEnergy = async (energy: number, lastUpdate: string, userId: number = 0) => {
    const now = new Date().toISOString()
    const energyToAdd = getDifferenceInSeconds(lastUpdate, now)
    let totalEnergy = energy + energyToAdd
    if (totalEnergy > 1000) {
        totalEnergy = 1000
    }
    const { data, error } = await supabase
        .from('user_parameters')
        .update({ value: totalEnergy, updated_at: now })
        .eq('user_id', userId )
        .eq('name', 'energy')
        .select()
        .single()
    // @ts-ignore
    return data?.value
}