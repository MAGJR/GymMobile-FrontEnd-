import { VStack, Image,Center, Heading, ScrollView, useToast } from 'native-base'
import {AuthNavigatorRoutesProps} from '@routes/auth.routes'
import {useNavigation} from '@react-navigation/native'

import backgroundImg from '@assets/background.png';
import LogoSvg from '@assets/logo.svg';
import {useForm,Controller} from 'react-hook-form'

import {useAuth} from '@hooks/userAuth'

import { Button } from '@components/Button';
import { Text } from 'native-base';
import { Input } from '@components/Input';
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';
import { AppError } from '@utils/AppError';
import { useState } from 'react';


 type FormLoginDataProps = {
    email: string,
    password: string,
    
} 

const  signIpSchema = yup.object({
    email: yup.string().required('Informe o e-mail').email('E-mail invalido'),
    password: yup.string().required('Informe a senha').min(6, ' a senha informada não tem 6 digitos')
})

export function SignIn() {
    const [isLoading, setIsLoading] = useState(false)

    const {signIn} = useAuth();
    const natigation = useNavigation<AuthNavigatorRoutesProps>();
    const toast = useToast();
    
    
    const {control, handleSubmit, formState: {errors}} = useForm<FormLoginDataProps>({
     resolver: yupResolver(signIpSchema)
    });

    function handleNewAccount() {
        natigation.navigate('SignUp')
    }

    async function handleSignIn ({email, password}: FormLoginDataProps) {
        try{
        setIsLoading(true);

        await signIn(email, password)
        
    }catch (error) {
       const isAppError = error instanceof AppError
       const title =  isAppError ? error.message : 'Não foi possível entrar. Tente novamente mais tarde.'
       
       setIsLoading(false)
       
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      });

      
    }
    }
    
    return (
        <ScrollView contentContainerStyle={{flexGrow: 1}} 
        showsVerticalScrollIndicator={false}
        >
        <VStack flex={1}  px={10}>
        <Image 
        source={backgroundImg}
        defaultSource={backgroundImg}
        alt="pessoas treinando"
        resizeMode='contain'
        position='absolute'
        />

        <Center my={24} >
        <LogoSvg />
        <Text color='gray.100' fontSize='sm'>
            Treine sua mente e o seu corpo
        </Text>
        </Center>

        <Center>
        <Heading color='gray.100'fontSize='xl' mb={6} fontFamily='heading'>
            Acesse sua conta
        </Heading>
        
        <Controller 
        name="email"
        control={control}
        render={({field: {onChange, value}}) => (
            
            <Input 
            placeholder="E-mail"
            keyboardType='email-address'
            autoCapitalize="none"
            onChangeText={onChange}
            value={value}
            errorMessage={errors.email?.message}
            />
        )}
        />
        
            <Controller 
            name="password"
            control={control}
            render={({field: {onChange, value}}) => (
            
            <Input 
            placeholder="senha"
            secureTextEntry
            onChangeText={onChange}
            value={value}
            errorMessage={errors.password?.message}
            />
        )}
        />

        
        <Button 
        title='Acessar'
        onPress={handleSubmit(handleSignIn)}
        isLoading={isLoading}
    
        />

        </Center>

        <Center mt={24}>
        <Text 
        color="gray.100"
        fontSize="sm"
        mb={3}
        fontFamily='body'
        >
         Ainda não tem acesso?
        </Text>

        <Button 
        title='Criar conta' 
        variant='outline'
        onPress={handleNewAccount}
        />
        </Center>
        </VStack>
        </ScrollView>
    );
}