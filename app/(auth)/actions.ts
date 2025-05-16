"use server";

import AppServer from "@/lib/server";
import { IUser } from "@/types/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// login user
export async function loginUser(data: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; user: IUser; message: string }> {
    const response = await AppServer.post("/users/login", data);

    // if (response.success) {
    //   redirect("/");
    // }

    return response.data as { success: boolean; user: IUser; message: string };
  }
  
  // register user
  export async function registerUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ success: boolean; user: IUser; message: string }> {
    const response = await AppServer.post("/users/register", data);

    // if (response.success) {
    //   redirect("/");
    // }
  
    return response.data as { success: boolean; user: IUser; message: string };
  }
  
  // logout user
  export async function logoutUser(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    redirect("/login");
  }
  