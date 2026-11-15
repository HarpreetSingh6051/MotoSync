import React from "react";
import { Redirect, type Href } from "expo-router";
// Open directly; old splash links remain compatible without voice or ignition prompts.
export default function EntryScreen() {
  return <Redirect href={"/home" as Href} />;
}
