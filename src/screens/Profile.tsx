import { useAuth } from '@hooks/userAuth';
import {useState} from 'react'
import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Controller, useForm } from 'react-hook-form';

import {yupResolver} from '@hookform/resolvers/yup'
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as yup from 'yup';

import userPhotoDefault from '@assets/userPhotoDefault.png'
import {Center, ScrollView, VStack, Skeleton, Text, Heading, useToast} from 'native-base';

import { TouchableOpacity } from 'react-native';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { api } from '@services/api';
import { AppError } from '@utils/AppError';


const PHOTO_SIZE = 33;

type FormDataProps ={
    name: string,
    email: string,
    password: string,
    old_password: string,
    confirm_password: string,
}

const ProfileSchema = yup.object({
    name: yup.string().required('Informe o nome'),
    password: yup.string().min(6, 'A senha deve ter pelo menos 6 dígitos.').nullable().transform((value) => !!value ? value : null),
  confirm_password: 
  yup.string()
  .nullable()
  .transform((value) => !!value ? value : null)
  .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere.')
  .when('password', {
    is: (Field: any) => Field,
    then: yup.string().nullable().required('Informe a confirmação da senha')
    .transform((value) => !!value ? value : null)
  }) 
    
})


export function Profile () {
    const [isUpdating, setIsUpdating] = useState(false);
    const [photoIsLoading, setPhotoIsLoading] = useState(false);
    

    const toast = useToast();
    const {user, updateUserProfile} = useAuth ();
    const {control, handleSubmit, formState: {errors} } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email,
            
        },
        resolver: yupResolver(ProfileSchema)
    });

    async function handleUserPhotoSelect () {

        setPhotoIsLoading(true);
        try {
            
       
        const PhotoSelected = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            aspect: [4, 4],
            allowsEditing: true,
            
        });

        if(PhotoSelected.canceled) {
         return;
        }

        if(PhotoSelected.assets[0].uri) {
            const photoInfo = await FileSystem.getInfoAsync(PhotoSelected.assets[0].uri);
            if(photoInfo.size && (photoInfo.size /1024 /1024) > 3){
                toast.show({
                    title: 'Essa imagem é muito grande. Escolha uma de até 3MB',
                    placement:'top',
                    bgColor: 'red.500'
                });
            }
            
            const filesExtension =  PhotoSelected.assets[0].uri.split('.').pop();
            
            const photoFile = {
                name: `${user.name}.${filesExtension}`.toLowerCase(),
                uri: PhotoSelected.assets[0].uri,
                type: `${PhotoSelected.assets[0].type}/${filesExtension}`
            } as any;
             
            const userPhotoUploadForm = new FormData();
            userPhotoUploadForm.append('avatar', photoFile);

            const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
                headers: {
                    'Content-Type' : 'multipart/form-data'
                }
            });

            const userUpdated = user;
            userUpdated.avatar = avatarUpdatedResponse.data.avatar;
            updateUserProfile(userUpdated)
            toast.show({
                title: 'Foto atualizada',
                placement: 'top',
                bgColor: 'green.500'
            })


            
           
        }
        }catch(error){
            console.log(error);

        } finally{
        setPhotoIsLoading(false);
    }
}

    async function handleProfileUpdate(data: FormDataProps){
       try {
        setIsUpdating(true)

        const userUpdate = user;
        userUpdate.name = data.name;

        await api.put('/users', data);
        
        await updateUserProfile(userUpdate);
        toast.show({
            title: 'Perfil atulizado com sucesso!',
            placement: 'top',
            bgColor: 'green.500'
        })
        
       } catch (error) {
        const isAppError = error instanceof AppError
        const title = isAppError ? error.message : 'Não foi possível atualizar os dados. Tente novamente mais tarde'

        toast.show({
            title,
            placement: 'top',
            bgColor: 'red.500'
        })
       }finally{
        setIsUpdating(false)
       }

    }


    return(
        <VStack flex={1}>
            <ScreenHeader title="Perfil"/>

            <ScrollView contentContainerStyle={{paddingBottom: 36}}>
            <Center mt={6} px={10}>

            {   photoIsLoading ?
                <Skeleton 
            w={PHOTO_SIZE } 
            h={PHOTO_SIZE} 
            rounded="full"
            startColor="gray.500"
            endColor="gray.400"
            />
             :
             <UserPhoto 
             source={
                user.avatar  
                ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } 
                : userPhotoDefault
              }
             alt="imagem do perfil"
             size={PHOTO_SIZE}
             />
             }

             <TouchableOpacity onPress={handleUserPhotoSelect}>
                <Text color="green.500" fontWeight="bold" fontSize="md" mt={12} mb={8}>
                    Alterar foto
                </Text>
             </TouchableOpacity>
            
            <Controller 
            name='name'
            control={control}
            render={({field: {onChange, value}}) => (
            <Input 
             placeholder='Nome'
             bg="gray.600"
             onChangeText={onChange}
             value={value}
             errorMessage={errors.name?.message}
             />
            )}
            />

            <Controller 
            name="email"
            control={control}
            render={({field: {onChange, value}}) => (
            <Input 
             bg="gray.600"
             isDisabled
             placeholder="E-mail"
             onChangeText={onChange}
             value={value}
             />
            )}
            /> 

             
             </Center>

             <VStack px={10} mt={12} mb={9}>
               <Heading color="gray.200" fontSize="md" mb={2} fontFamily="heading">
                Alterar senha
               </Heading>
               
                <Controller 
                name="old_password"
                control={control}
                render={({field: {onChange, }}) => (
                <Input 
               bg="gray.600"
               placeholder="Senha antiga"
               secureTextEntry
               onChangeText={onChange}
               
               />
                )}
                />

               <Controller 
               name="password"
               control={control}
               render={({field: {onChange, }}) => (
                <Input 
                 bg="gray.600"
                 placeholder="Nova senha"
                 secureTextEntry
                 onChangeText={onChange}
                 errorMessage={errors.password?.message}
               />

               )}
               />
            
            <Controller 
            name="confirm_password"
            control={control}
            render={({field: {onChange}}) => (
                <Input 
                bg="gray.600"
                placeholder="Confirme a nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.confirm_password?.message}
                />
            )}
            />
            

                <Button 
                title="atualizar"
                mt={4}
                onPress={handleSubmit(handleProfileUpdate)}
                isLoading={isUpdating}
                />
             </VStack>
             
            </ScrollView>
            
        </VStack>
    );
}