import { VStack, Image,Center, Heading, ScrollView, useToast } from 'native-base'
import {AuthNavigatorRoutesProps} from '@routes/auth.routes'
import {useNavigation} from '@react-navigation/native'
import {useForm, Controller } from 'react-hook-form'


import {api} from '@services/api';

import * as yup from 'yup';
import {yupResolver} from  '@hookform/resolvers/yup'

import backgroundImg from '@assets/background.png';
import LogoSvg from '@assets/logo.svg';


import { Button } from '@components/Button';
import { Text } from 'native-base';
import { Input } from '@components/Input';
import { AppError } from '@utils/AppError';
import { useState } from 'react';
import {useAuth} from '@hooks/userAuth'

type FormDataProps = {
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
} 

const signUpSchema = yup.object({
name: yup.string().required('Informe o nome'),
email: yup.string().required('informe o E-mail').email('E-mail invalido'),
password: yup.string().required('Informe a senha').min(6, 'A senha deve pelo menos ter 6 dígitos'),
confirmPassword: yup.string().required('Confirme a senha ').oneOf([yup.ref('password'), null], 'A confirmação da senha não confere')
});

export function SignUp() {
    const [isLoading, setIsLoading] = useState(false)
    const navigation = useNavigation<AuthNavigatorRoutesProps>();
    const {signIn} = useAuth();
    const toast = useToast();   
   

const {control, handleSubmit, formState: {errors}} = useForm<FormDataProps>({
resolver: yupResolver(signUpSchema)
});

function handleGoToLogin () {
     navigation.goBack();
}

async function handleSignUp ({name, email, password,}:FormDataProps) {

        
        try{
            setIsLoading(true)

              await api.post('/users', {name, email, password}); /* This is method POST with Axios from Api the Axios inside folders services*/
              await signIn(email, password); 

        } catch(error){ 
            setIsLoading(false)

         const isAppError = error instanceof AppError;
         
         const title = isAppError ? error.message : 'Não foi possível criar a conta, tente mais tarde novamente '
         toast.show({ /* send a message personalized com useToast */
         title,
         placement: 'top',
         bgColor: 'red.500' 
         })

        }

        /* YOU CAN PUT IT Method Post, but is very complicated, there is many codes 
        const response = await fetch('http://192.168.0.107:3333/users', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, email, password})
        })
        
        const data = await response.json();
        console.log(data);
        */
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
            Crie sua conta
        </Heading>

        <Controller 
        control={control}
        name="name"
        render={({field : {onChange, value}}) => (
        <Input 
        placeholder="Nome"
        onChangeText={onChange}
        value={value}
        errorMessage={errors.name?.message}
        
        />
        )}
        />
    
        <Controller 
        control={control}
        name="email"
        render={({field : {onChange, value}}) => (
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
        control={control}
        name="password"
        
      
        render={({field : {onChange, value}}) => (
        <Input

        placeholder="Senha"
        secureTextEntry
        onChangeText={onChange}
        value={value}
        errorMessage={errors.password?.message}
        />
        )}
        />

       

        <Controller 
        control={control}
        name="confirmPassword"
        rules={{
            required: 'confirme a senha'
        }}
        render={({field : {onChange, value}}) => (
        <Input 
         placeholder="Confirmar a senha"
         secureTextEntry
         onChangeText={onChange}
         errorMessage={errors.confirmPassword?.message}
         value={value}
         onSubmitEditing={handleSubmit(handleSignUp)}
         returnKeyType="send"
            />
        )}
        />
        

        <Button 
        title='Criar e acessar' 
        onPress={handleSubmit(handleSignUp)}
        />

        </Center>

        <Button 
        mt={16}
        title='Voltar para o login' 
        variant='outline'
        onPress={handleGoToLogin}
        isLoading={isLoading}
        />
        
        </VStack>
        </ScrollView>
    );
}