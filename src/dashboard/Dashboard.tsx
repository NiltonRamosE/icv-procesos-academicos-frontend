"use client"
import React, { useState } from "react";
import { config } from "config.ts";
export function DashboardICV() {

  console.log(`${config.apiUrl}${config.endpoints.auth.login}`);

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 text-white">
        Este es el dashboard
      </section>
    </>
  );
};