import { UserDTO } from "@dtos/userDTO";
import { createContext, ReactNode, useEffect, useState } from "react";
import {storageAuthTokenSave, storageAuthTokenGet, StorageAuthTokenRemove} from '@storage/storageAuthToken'
import {api} from '@services/api'
import {storageUserSave, storageUserGet, storageUserRemove } from '@storage/sotrageUser'

export type AuthContextProps = {
    user: UserDTO,
    updateUserProfile: (userUpdate: UserDTO) => void, 
    signIn: (email: string, password: string) => Promise<void>;
    isLoadingUserStorageData: boolean;
    signOut: () => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode; 
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);


export function AuthContextProvider ({children }:AuthContextProviderProps ) {
const [user, setUser] = useState<UserDTO>({} as UserDTO);
const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);

async function UserAndTokenUptade(userData: UserDTO, token: string) {
     api.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
     setUser(userData);
    
   
}

async function storageUserAndTokenSave(userData: UserDTO, token: string, refresh_token: string) {
    try{
    setIsLoadingUserStorageData(true);

    await storageUserSave(userData);
    await storageAuthTokenSave({token,refresh_token});

}catch(error){
    throw error;
}finally{
    setIsLoadingUserStorageData(false);
}

}

async function signIn (email: string, password: string){

    try{
    const { data } = await api.post('/sessions', {email, password})
    
    if(data.user && data.token && data.refresh_token) {
      await storageUserAndTokenSave(data.user, data.token, data.refresh_token);
      UserAndTokenUptade(data.user, data.token);
 
 }
}catch(error){
    throw error;
}finally{
    setIsLoadingUserStorageData(false);
}
 

}

async function signOut () {
    try {
        setIsLoadingUserStorageData(true)
        setUser({} as UserDTO) /* notification rotes what not have ID insde user and remove it*/
        await StorageAuthTokenRemove();
        await storageUserRemove();

    } catch (error) {
        throw error
    }finally{
        setIsLoadingUserStorageData(false)
    }
}

async function updateUserProfile (userUpdated: UserDTO) {
    try {
        setUser(userUpdated);

        await storageUserSave(userUpdated)
    } catch (error) {
        throw error;
    }
}

async function loadUserData(){
    try{
        setIsLoadingUserStorageData(true); 
        
    const userLogged = await storageUserGet();
    const {token} = await storageAuthTokenGet();

    if(token && userLogged){
        UserAndTokenUptade(userLogged, token, );
    }
    
}catch(error){
    throw error;

}finally{
setIsLoadingUserStorageData(false); 

 }
}

 useEffect(() => {
    loadUserData();
}, []);

useEffect(() => {
    const subscribe = api.registerInterceptTokenManager(signOut);

    return() => {
        subscribe();
    }
},[signOut])

    
    return(
    < AuthContext.Provider value={{ 
        user,
        updateUserProfile, 
        signIn,
        signOut,
        isLoadingUserStorageData }}>
      {children}
      </AuthContext.Provider>
      )
}

