"use client"
import React, { useState } from "react";
import { config } from "config.ts";
import { Navbar } from "@/shared/Navbar";

export function ManagementGroup() {

  console.log(`${config.apiUrl}${config.endpoints.auth.login}`);


  return (
    <>
      <Navbar />
      <section className="grid grid-cols-1 md:grid-cols-2 text-white">
          Este es el ManagementGroup
      </section>
    </>
  );
};