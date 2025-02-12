'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { Loader2 } from "lucide-react"
import { signUpSchema } from '@/schemas/signUpSchema'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"



const page = () => {
    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const debounced = useDebounceCallback(setUsername, 500)
    const { toast } = useToast()
    const router = useRouter()
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: ''
        }
    })

    useEffect(() => {
        const checkUsernameUnique = async () => {

            if (username) {

                setIsCheckingUsername(true)
                setUsernameMessage('')
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
                    setUsernameMessage(response.data.message)
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>
                    setUsernameMessage(axiosError.response?.data.message || 'An error occurred')
                }
                finally {
                    setIsCheckingUsername(false)
                }
            }
        }
        checkUsernameUnique()
    }, [username])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post('/api/sign-up', data)
            toast({
                title: '✅ Success',
                description: response.data.message
            })
            router.replace(`/verify/${username}`)
            setIsSubmitting(false)
        } catch (error) {
            console.log("error in sign up", error)
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message

            toast({
                title: " ⚠️ Sign-up failed",
                description: errorMessage,
                variant: "destructive"
            })
            setIsSubmitting(false)
        }
    }


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100"
        style={{
          backgroundImage: 'url(/msg.avif)',
          boxSizing: 'border-box' 
        }}>
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg shadow-black">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-center">Join Shadow Talk </h1>
            <p className="mb-4">Create an account to continue</p> 
          </div>
          <Form{...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
            name="username"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="write username" {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    debounced(e.target.value);
                  }}
                  />
                </FormControl>
                {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin"/>}
                <p className={`text-sm ${usernameMessage.includes('available') ? 'text-green-600' : 'text-red-600'}`}>
                  {usernameMessage}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email" {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="password" {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Please wait</>) : 'Sign up'}
          </Button> 
            </form>
          </Form>
          <div className="text-center mt-4">
            <p>Already have an account? <Link href="/sign-in" className="text-blue-600 hover:underline">Sign In</Link></p>
          </div>
        </div>
      </div>
    )
}

export default page
