"use client"
import React from "react";
import { RegisterForm } from "@/auth/components/register-form";

export function RegisterPage() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:block">
        <img
          src="/academico/images/bg-login-pc.webp"
          alt="Imagen de bienvenida"
          className="w-md h-md lg:w-lg lg:h-lg xl:w-5xl xl:h-5xl"
          loading="lazy"
        />
      </div>

      <div className="md:hidden w-full relative p-0">
        <div className="m-0 h-full w-full absolute">
          <div className="overflow-hidden h-full absolute w-full">
            <img
              src="/academico/images/bg-message.webp"
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
                src="/academico/images/bg-login-guy.webp"
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
        <RegisterForm />
        </div>
      </div>
    </section>
  );
};