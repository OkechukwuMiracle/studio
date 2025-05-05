
"use server";

import { z } from "zod";

// In-memory store (replace with a database in production)
interface Submission {
  phoneNumber: string;
  selectedFood: string;
  selectedDrinks: string[]; // Array for drinks
  timestamp: Date;
}
const submissions: Submission[] = [];
const submittedPhoneNumbers = new Map<string, Submission>(); // Use Map for easier duplicate check and retrieval

// Schemas
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format. Use E.164 (e.g., +1234567890).");
const foodSchema = z.string().min(1, "Please select a food item."); // Single food item
const drinksSchema = z.array(z.string()).optional(); // Optional array of drinks

// Define the shape of the successful return value
interface SuccessSubmission {
    phoneNumber: string;
    selectedFood: string;
    selectedDrinks?: string[];
}

// Update SubmitResult to include submission data on success
export interface SubmitResult {
  success: boolean;
  message: string;
  error?: 'validation' | 'database' | 'duplicate_phone' | 'unknown'; // More specific error categories
  fieldErrors?: Record<string, string[]> | null; // Use null for consistency
  submission?: SuccessSubmission | null; // Data returned on success
}

export async function submitPhoneNumber(prevState: SubmitResult | null, formData: FormData): Promise<SubmitResult> {
  const selectedFood = formData.get("selectedFood") as string | null;
  const selectedDrinks = formData.getAll("selectedDrinks") as string[]; // Get all drinks
  const phoneNumber = formData.get("phoneNumber") as string | null;

  console.log("Server Action: Received data:", { selectedFood, selectedDrinks, phoneNumber });

  let fieldErrors: Record<string, string[]> = {};
  let isValid = true;

  // 1. Validate Food Selection
  const validatedFood = foodSchema.safeParse(selectedFood);
  if (!validatedFood.success) {
    console.error("Server Action: Invalid food selection", validatedFood.error.flatten());
    fieldErrors.selectedFood = validatedFood.error.flatten().formErrors;
    isValid = false;
  }

  // 2. Validate Drinks Selection (optional, so only check if present - schema handles type)
   const validatedDrinks = drinksSchema.safeParse(selectedDrinks);
   if (!validatedDrinks.success) {
       console.error("Server Action: Invalid drinks selection", validatedDrinks.error.flatten());
       // Add drink errors if needed, though less critical as it's optional
       // fieldErrors.selectedDrinks = validatedDrinks.error.flatten().formErrors;
       // isValid = false; // Don't invalidate just for drinks if they are optional
   }


  // 3. Validate Phone Number (must be present now)
  let cleanPhoneNumber: string | null = null;
  if (!phoneNumber) {
      console.error("Server Action: Phone number missing");
      fieldErrors.phoneNumber = ["Phone number is required."];
      isValid = false;
  } else {
      const validatedPhone = phoneSchema.safeParse(phoneNumber);
      if (!validatedPhone.success) {
          console.error("Server Action: Invalid phone number format", validatedPhone.error.flatten());
          fieldErrors.phoneNumber = validatedPhone.error.flatten().formErrors;
          isValid = false;
      } else {
          cleanPhoneNumber = validatedPhone.data;
      }
  }

  // If validation failed early, return errors
  if (!isValid || !cleanPhoneNumber || !validatedFood.success) { // Ensure cleanPhoneNumber and food are valid
      return {
          success: false,
          message: "Validation failed. Please check the highlighted fields.",
          error: 'validation',
          fieldErrors,
          submission: null,
      };
  }

  // 4. Check for Duplicate Phone Number
  if (submittedPhoneNumbers.has(cleanPhoneNumber)) {
      console.warn("Server Action: Phone number already submitted:", cleanPhoneNumber);
      return {
          success: false,
          message: "This phone number has already been used to submit a selection.",
          error: 'duplicate_phone', // Specific error code for duplicate
          fieldErrors: { phoneNumber: ["This phone number has already submitted a selection."] },
          submission: null,
      };
  }

  // 5. Simulate saving to backend
  try {
      const newSubmission: Submission = {
          phoneNumber: cleanPhoneNumber,
          selectedFood: validatedFood.data, // Use validated food data
          selectedDrinks: validatedDrinks.data || [], // Use validated drinks data or empty array
          timestamp: new Date(),
      };
      submissions.push(newSubmission);
      submittedPhoneNumbers.set(cleanPhoneNumber, newSubmission); // Add to map

      console.log("Server Action: Added submission:", newSubmission);
      console.log("Server Action: Total submissions:", submissions.length);

      // Return success with the submitted data (excluding timestamp)
      const successData: SuccessSubmission = {
         phoneNumber: newSubmission.phoneNumber,
         selectedFood: newSubmission.selectedFood,
         selectedDrinks: newSubmission.selectedDrinks.length > 0 ? newSubmission.selectedDrinks : undefined, // Only include if drinks were selected
      };

      return {
          success: true,
          message: "Your selection has been recorded!",
          submission: successData, // Include the selected data
          error: undefined,
          fieldErrors: null,
      };

  } catch (error) {
      console.error("Server Action: Error saving submission:", error);
      return {
          success: false,
          message: "An unexpected error occurred while saving your selection. Please try again.",
          error: 'database', // General category for server/DB errors
          fieldErrors: null,
          submission: null,
      };
  }
}

// --- Database Simulation ---
// Kept in memory as per previous implementation. Replace with actual DB logic if needed.
