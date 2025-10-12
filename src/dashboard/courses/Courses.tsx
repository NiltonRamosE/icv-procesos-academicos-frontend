"use client"
import React, { useState } from "react";
import { config } from "config.ts";

export function Courses() {

  console.log(`${config.apiUrl}${config.endpoints.auth.login}`);

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 text-white">
        Este es la página de cursos
      </section>
    </>
  );
};