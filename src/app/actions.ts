"use server";

import { z } from "zod";

// In-memory store for submissions (replace with a database in production)
interface Submission {
  phoneNumber: string;
  selectedFood: string;
  selectedDrinks: string[];
  timestamp: Date;
}
const submissions: Submission[] = [];
const submittedPhoneNumbers = new Map<string, Submission>();

// Schemas
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format. Use E.164 (e.g., +1234567890).");
const foodSchema = z.string().min(1, "Please select a food item.");
const drinksSchema = z.array(z.string()).optional();

interface SuccessSubmission {
    phoneNumber: string;
    selectedFood: string;
    selectedDrinks?: string[];
}

export interface SubmitResult {
  success: boolean;
  message: string;
  error?: 'validation' | 'database' | 'duplicate_phone' | 'unknown';
  fieldErrors?: Record<string, string[]> | null;
  submission?: SuccessSubmission | null;
}

export async function submitPhoneNumber(prevState: SubmitResult | null, formData: FormData): Promise<SubmitResult> {
  const selectedFood = formData.get("selectedFood") as string | null;
  const selectedDrinksRaw = formData.getAll("selectedDrinks");
  const phoneNumber = formData.get("phoneNumber") as string | null;

  const selectedDrinks = Array.isArray(selectedDrinksRaw) ? 
    selectedDrinksRaw.filter(d => typeof d === 'string') as string[] : 
    (typeof selectedDrinksRaw === 'string' ? [selectedDrinksRaw] : []);

  let fieldErrors: Record<string, string[]> = {};
  let isValid = true;

  const validatedFood = foodSchema.safeParse(selectedFood);
  if (!validatedFood.success) {
    fieldErrors.selectedFood = validatedFood.error.flatten().formErrors;
    isValid = false;
  }

  const validatedDrinks = drinksSchema.safeParse(selectedDrinks);
  if (!validatedDrinks.success) {
    console.warn("Invalid drinks selection format", validatedDrinks.error.flatten());
  }

  let cleanPhoneNumber: string | null = null;
  if (!phoneNumber) {
    fieldErrors.phoneNumber = ["Phone number is required."];
    isValid = false;
  } else {
    const validatedPhone = phoneSchema.safeParse(phoneNumber);
    if (!validatedPhone.success) {
      fieldErrors.phoneNumber = validatedPhone.error.flatten().formErrors;
      isValid = false;
    } else {
      cleanPhoneNumber = validatedPhone.data;
    }
  }

  if (!isValid || !cleanPhoneNumber || !validatedFood.success) {
    return {
      success: false,
      message: "Validation failed. Please check the highlighted fields.",
      error: 'validation',
      fieldErrors,
      submission: null,
    };
  }

  if (submittedPhoneNumbers.has(cleanPhoneNumber)) {
    return {
      success: false,
      message: "This phone number has already been used to submit a selection.",
      error: 'duplicate_phone',
      fieldErrors: { phoneNumber: ["This phone number has already submitted a selection."] },
      submission: null,
    };
  }

  try {
    const newSubmission: Submission = {
      phoneNumber: cleanPhoneNumber,
      selectedFood: validatedFood.data,
      selectedDrinks: validatedDrinks.data || [],
      timestamp: new Date(),
    };
    submissions.push(newSubmission);
    submittedPhoneNumbers.set(cleanPhoneNumber, newSubmission);

    const successData: SuccessSubmission = {
      phoneNumber: newSubmission.phoneNumber,
      selectedFood: newSubmission.selectedFood,
      selectedDrinks: newSubmission.selectedDrinks.length > 0 ? newSubmission.selectedDrinks : undefined,
    };

    return {
      success: true,
      message: "Your selection has been recorded!",
      submission: successData,
      error: undefined,
      fieldErrors: null,
    };
  } catch (error) {
    console.error("Error saving submission:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      error: 'database',
      fieldErrors: null,
      submission: null,
    };
  }
}
