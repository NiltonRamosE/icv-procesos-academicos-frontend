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
import {GoogleLoginButton} from "@/auth/components/google-login-button";
import { config } from "config.ts"

const FormSchema = z.object({
  email: z
    .string()
    /* .email({
      message: "Por favor, ingresa una dirección de correo válida.",
    }) */
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
    /* .regex(/[A-Z]/, {
      message: "La contraseña debe contener al menos una letra mayúscula.",
    })
    .regex(/[0-9]/, {
      message: "La contraseña debe contener al menos un número.",
    })
    .regex(/[\W_]/, {
      message: "La contraseña debe contener al menos un carácter especial (por ejemplo, !@#$%^&*).",
    }), */
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth.login}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Login response:", responseData);
        localStorage.setItem("token", JSON.stringify(responseData.token));
        localStorage.setItem("user", JSON.stringify(responseData.user));
        toast.success("¡Inicio de sesión exitoso!", {
          description: "Redirigiendo a tu dashboard.",
        });
        
        setTimeout(() => {
          window.location.href = "/academico/dashboard";
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message || "Algo salió mal."}`);
      }
    } catch (error) {
      toast.error("Hubo un error al conectar con el servidor.");
    }

    // Este toast solo se muestra en desarrollo para ver los datos
    toast.info("Datos del formulario:", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Inicia sesión en tu cuenta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Ingresa tu correo electrónico para acceder a tu cuenta
          </p>
        </div>
        
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password" 
            type="password" 
            placeholder="Ingresa tu contraseña"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </Field>

        <Field>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </Field>

        <FieldSeparator>O continúa con</FieldSeparator>
        
        <Field>
          <GoogleLoginButton text="Iniciar Sesión con Google"/>
          <FieldDescription className="text-center">
            ¿No tienes una cuenta?{" "}
            <a href="/academico/register" className="underline underline-offset-4">
              Regístrate
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}