"use client"
import React, { useState } from "react";
import { config } from "config.ts";


export function Courses() {

  console.log(`${config.apiUrl}${config.endpoints.auth.login}`);


  return (
    <section className="grid grid-cols-1 md:grid-cols-2 text-white">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias distinctio blanditiis, velit dignissimos culpa dicta mollitia, nam reprehenderit error cumque praesentium. Minima esse, et fugiat dicta odit assumenda libero earum?
    </section>
  );
};