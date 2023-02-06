import { useContext } from 'react';
import {useTheme, Box} from 'native-base'
import {NavigationContainer, DefaultTheme} from '@react-navigation/native'

import { useAuth } from '@hooks/userAuth';

import { AuthRoutes } from './auth.routes';
import { AppRoutes } from './app.routes'
import { Loading } from '@components/Loading';

export function Routes () {

 const {colors} = useTheme();
 const {user, isLoadingUserStorageData} = useAuth(); 
 
 /* When i utilised "useAuth he came from to Auth, i created a hook
    that utilises the "useAuth" hook to get the user here
    When i put user. return email, name, id, etc..
    */
 
 
 const theme = DefaultTheme;

 theme.colors.background =  colors.gray[700];

      /*this element make the element return component of the loading before auth of user.id */
    if(isLoadingUserStorageData){
       return <Loading />
    }

    return(
    <Box flex={1} bg='gray.700'>
     <NavigationContainer theme ={theme}>
      {user.id? <AppRoutes /> : <AuthRoutes />}
     </NavigationContainer>
    </Box>
    );
}