"use server";

import { z } from "zod";

// In-memory store for phone numbers (replace with a database in production)
const submittedPhoneNumbers = new Set<string>();

const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"); // Basic E.164 check

interface SubmitResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function submitPhoneNumber(prevState: any, formData: FormData): Promise<SubmitResult> {
  const phoneNumber = formData.get("phoneNumber") as string;
  const selectedMeal = formData.get("selectedMeal") as string; // Get selected meal

  console.log("Server Action: Received phone number:", phoneNumber, "Meal:", selectedMeal);


  if (!selectedMeal) {
      return { success: false, message: "Please select a meal first.", error: "meal" };
  }

  const validatedPhone = phoneSchema.safeParse(phoneNumber);

  if (!validatedPhone.success) {
    console.error("Server Action: Invalid phone number format", validatedPhone.error.flatten());
    return { success: false, message: "Invalid phone number format. Please enter a valid number (e.g., +1234567890).", error: "phoneNumber" };
  }

  const cleanPhoneNumber = validatedPhone.data;

  if (submittedPhoneNumbers.has(cleanPhoneNumber)) {
    console.warn("Server Action: Phone number already submitted:", cleanPhoneNumber);
    return { success: false, message: "This phone number has already been used to select a meal.", error: "phoneNumber" };
  }

  // Simulate saving to backend
  submittedPhoneNumbers.add(cleanPhoneNumber);
  console.log("Server Action: Added phone number:", cleanPhoneNumber, "Total submitted:", submittedPhoneNumbers.size);
  console.log("Server Action: Meal selected:", selectedMeal)

  // In a real app, you would save { cleanPhoneNumber, selectedMeal, timestamp } to your database here.

  return { success: true, message: "Your meal selection has been recorded!" };
}
