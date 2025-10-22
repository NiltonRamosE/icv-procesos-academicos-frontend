"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { config } from "config.ts"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

const FormSchema = z.object({
  dni: z
    .string()
    .min(8, {
      message: "El DNI debe tener al menos 8 caracteres.",
    })
    .max(8, {
      message: "El DNI no debe exceder los 8 caracteres.",
    })
    .regex(/^[0-9]+$/, {
      message: "El DNI solo debe contener números.",
    }),
  
  email: z
    .string()
    .email({
      message: "Por favor, ingresa una dirección de correo válida.",
    })
    .min(1, {
      message: "El correo electrónico es obligatorio.",
    }),

  password: z
    .string()
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres.",
    })
    .max(20, {
      message: "La contraseña no debe exceder los 20 caracteres.",
    })
    .regex(/[A-Z]/, {
      message: "Debe contener al menos una letra mayúscula.",
    })
    .regex(/[0-9]/, {
      message: "Debe contener al menos un número.",
    }),
  
  password_confirmation: z
    .string()
    .min(1, {
      message: "Debes confirmar tu contraseña.",
    }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Las contraseñas no coinciden.",
  path: ["password_confirmation"],
})

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dni: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth.register}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dni: data.dni,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        
        toast.success("¡Registro exitoso!", {
          description: "Tu cuenta ha sido creada. Redirigiendo al inicio de sesión.",
        })
        
        reset()
        
        setTimeout(() => {
          window.location.href = "/academico"
        }, 2000)
      } else {
        const errorData = await response.json()
        
        if (errorData.errors) {
          Object.keys(errorData.errors).forEach((key) => {
            errorData.errors[key].forEach((error: string) => {
              toast.error(error)
            })
          })
        } else {
          toast.error(`Error: ${errorData.message || "Algo salió mal durante el registro."}`)
        }
      }
    } catch (error) {
      console.error("Error de registro:", error)
      toast.error("Hubo un error al conectar con el servidor.")
    }
  }

  return (
    <div 
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Completa los datos para registrarte en la plataforma
          </p>
        </div>
        
        <Field>
          <FieldLabel htmlFor="dni">DNI / Documento</FieldLabel>
          <Input 
            id="dni" 
            type="text" 
            placeholder="12345678" 
            maxLength={12}
            {...register("dni")}
          />
          {errors.dni && (
            <p className="text-sm text-red-500 mt-1">{errors.dni.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="tu@correo.com" 
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <div className="relative">
            <Input
              id="password" 
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
          <FieldDescription className="text-xs">
            Debe contener al menos 8 caracteres, una mayúscula y un número
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="password_confirmation">Confirmar Contraseña</FieldLabel>
          <div className="relative">
            <Input
              id="password_confirmation" 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repite tu contraseña"
              className="pr-10"
              {...register("password_confirmation")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-sm text-red-500 mt-1">{errors.password_confirmation.message}</p>
          )}
        </Field>

        <Field>
          <Button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </Field>

        <FieldSeparator>O regístrate con</FieldSeparator>
        
        <Field>
          <Button variant="outline" type="button" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Registrarse con Google
          </Button>
          <FieldDescription className="text-center">
            ¿Ya tienes una cuenta?{" "}
            <a href="/academico" className="underline underline-offset-4 hover:text-primary transition-colors">
              Inicia sesión
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </div>
  )
}