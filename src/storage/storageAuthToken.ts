import AsyncStorage from '@react-native-async-storage/async-storage';

import { AUTH_USER_TOKEN } from '@storage/storageConfig';

type StorageAuthTokenProps= {
    token: string,
     refresh_token: string
}
export async function storageAuthTokenSave ({token, refresh_token }: StorageAuthTokenProps) {
await AsyncStorage.setItem(AUTH_USER_TOKEN, JSON.stringify({token, refresh_token}))

};

export async function storageAuthTokenGet () {
    const response = await AsyncStorage.getItem(AUTH_USER_TOKEN);

    const {token, refresh_token}:StorageAuthTokenProps = response ? JSON.parse(response) : {}; 

    return {token, refresh_token};   
};


export async function StorageAuthTokenRemove () {
     await AsyncStorage.removeItem(AUTH_USER_TOKEN);

    
}