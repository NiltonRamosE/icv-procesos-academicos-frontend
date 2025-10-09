"use client"
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
} from "@/components/ui/form"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  MailIcon,
} from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { config } from "config.ts";

const FormSchema = z.object({
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
      message: "La contraseña debe contener al menos una letra mayúscula.",
    })
    .regex(/[0-9]/, {
      message: "La contraseña debe contener al menos un número.",
    })
    .regex(/[\W_]/, {
      message: "La contraseña debe contener al menos un carácter especial (por ejemplo, !@#$%^&*).",
    }),
});

export function Login() {

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = {
        ok: true,
        json: async () => ({
          message: "Inicio de sesión exitoso",
          token: "fake-jwt-token",
        }),
      };
      /* const response = await fetch(`${config.apiUrl}${config.endpoints.auth.login}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      }); */

      if (response.ok) {
        const responseData = await response.json();
        console.log("Login response:", responseData);
        // localStorage.setItem("token", responseData.token);

        toast("¡Inicio de sesión exitoso!", {
          description: "Redirigiendo a tu dashboard.",
        });
        window.location.href = "/dashboard/cursos";
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message || "Algo salió mal."}`);
      }
    } catch (error) {
      toast.error("Hubo un error al conectar con el servidor.");
    }

    toast("You submitted the following values", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:block">
        <img
          src="/images/bg-login-pc.webp"
          alt="Imagen de bienvenida"
          className="w-md h-md lg:w-lg lg:h-lg xl:w-5xl xl:h-5xl"
          loading="lazy"
        />
      </div>

      <div className="md:hidden w-full relative p-0">
        <div className="m-0 h-full w-full absolute">
          <div className="overflow-hidden h-full absolute w-full">
            <img
              src="/images/bg-message.webp"
              alt=" Imagen de bienvenida"
              className="w-full h-full scale-160 object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="relative w-full h-full pt-18 p-8 md:p-10 md:pb-0 sm:p-15 sm:pb-0 pb-0">
          <div className="">
            <h1 className="text-5xl sm:text-6xl font-semibold mb-2 text-white">¡Bienvenido!</h1>
          </div>
          <div className="flex w-full mb-0 p-0 justify-between flex-wrap">
            <p className="w-1/2 text-xl sm:text-3xl font-light text-white">
              Que esperas para capacitarte.
            </p>

            <div className="w-1/2">
              <img
                src="/images/bg-login-guy.webp"
                alt="Imagen de bienvenida"
                className="object-cover scale-x-[-1]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 sm:px-10 lg:px-0 md:rounded-none md:mt-0 rounded-b-none rounded-4xl z-20 mt-[-50px] bg-theme-night pt-10">
        <div className="w-full max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldSet>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="email" className="text-white">Correo</FieldLabel>
                      <FieldDescription>
                        Debes ingresar un correo gmail.
                      </FieldDescription>
                      <InputGroup>
                        <FormControl>
                          <InputGroupInput type="email" placeholder="Enter your email" className="text-white" {...field}/>
                        </FormControl>
                        <InputGroupAddon>
                          <MailIcon />
                        </InputGroupAddon>
                      </InputGroup>
                      <FormMessage />
                    </Field>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="password" className="text-white">Contraseña</FieldLabel>
                      <FieldDescription>
                        La contraseña debe contar con 8 caracteres.
                      </FieldDescription>
                      <FormControl>
                        <Input id="password" type="password" placeholder="********" className="text-white" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
            <Button type="submit" className="bg-theme-deep-sky-blue hover:bg-theme-deep-sky-blue/80">Iniciar Sesión</Button>
          </form>
        </Form>
        </div>
      </div>
    </section>
  );
};