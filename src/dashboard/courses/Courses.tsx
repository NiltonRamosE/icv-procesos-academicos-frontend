"use client"
import React, { useState } from "react";
import { config } from "config.ts";
import { Navbar } from "@/shared/Navbar";

export function Courses() {

  console.log(`${config.apiUrl}${config.endpoints.auth.login}`);


  return (
    <>
      
      <main>
        <Navbar />
        <section className="grid grid-cols-1 md:grid-cols-2 text-white">
          Este es la página de cursos
        </section>
      </main>
    </>
  );
};