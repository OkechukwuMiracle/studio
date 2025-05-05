"use server";

import { z } from "zod";

// In-memory store (replace with a database in production)
interface Submission {
  phoneNumber: string;
  selectedItems: string[];
  timestamp: Date;
}
const submissions: Submission[] = [];
const submittedPhoneNumbers = new Set<string>(); // Keep track for uniqueness check

// Schemas
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format. Use E.164 (e.g., +1234567890).");
const itemsSchema = z.array(z.string()).min(1, "Please select at least one item."); // Ensure at least one item

interface SubmitResult {
  success: boolean;
  message: string;
  error?: string; // General error category
  fieldErrors?: Record<string, string[]>; // Field-specific errors
}

export async function submitPhoneNumber(prevState: any, formData: FormData): Promise<SubmitResult> {
  const selectedItems = formData.getAll("selectedItems") as string[]; // Get all selected items
  const phoneNumber = formData.get("phoneNumber") as string | null; // Phone number might not be present if form submitted early

  console.log("Server Action: Received data:", { selectedItems, phoneNumber });

  // 1. Validate Selected Items
  const validatedItems = itemsSchema.safeParse(selectedItems);
  if (!validatedItems.success) {
    console.error("Server Action: Invalid items selection", validatedItems.error.flatten());
    return {
      success: false,
      message: "Validation failed.",
      fieldErrors: { selectedItems: validatedItems.error.flatten().formErrors },
    };
  }

  // 2. Validate Phone Number (only if provided)
  let cleanPhoneNumber: string | null = null;
  if (phoneNumber) {
      const validatedPhone = phoneSchema.safeParse(phoneNumber);
      if (!validatedPhone.success) {
          console.error("Server Action: Invalid phone number format", validatedPhone.error.flatten());
          return {
              success: false,
              message: "Validation failed.",
              fieldErrors: { phoneNumber: validatedPhone.error.flatten().formErrors },
          };
      }
      cleanPhoneNumber = validatedPhone.data;

      // 3. Check for Duplicate Phone Number
      if (submittedPhoneNumbers.has(cleanPhoneNumber)) {
          console.warn("Server Action: Phone number already submitted:", cleanPhoneNumber);
          return {
              success: false,
              message: "This phone number has already been used to submit a selection.",
              fieldErrors: { phoneNumber: ["This phone number has already submitted a selection."] },
          };
      }
  } else {
       // This case should ideally be prevented by client-side logic, but handle defensively
       console.error("Server Action: Phone number missing");
       return {
           success: false,
           message: "Phone number is required.",
           fieldErrors: { phoneNumber: ["Phone number is required."] },
       };
  }


  // 4. Simulate saving to backend (Replace with actual database logic)
  try {
      const newSubmission: Submission = {
          phoneNumber: cleanPhoneNumber!, // We've validated it's not null here
          selectedItems: validatedItems.data,
          timestamp: new Date(),
      };
      submissions.push(newSubmission);
      submittedPhoneNumbers.add(cleanPhoneNumber!); // Add to the set for uniqueness check

      console.log("Server Action: Added submissions:", newSubmission);
      console.log("Server Action: Total submissions:", submissions.length);

      return { success: true, message: "Your selection has been recorded!" };

  } catch (error) {
      console.error("Server Action: Error saving submission:", error);
      return {
          success: false,
          message: "An unexpected error occurred while saving your selection. Please try again.",
          error: "database", // General category for server/DB errors
      };
  }
}

// --- Database Simulation (Keep in memory for this example) ---
// In a real application, you would replace the `submissions` array and
// `submittedPhoneNumbers` set with interactions with a database like
// Firestore, PostgreSQL, MongoDB, etc.

// Example using Firestore (requires setup):
/*
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Assume you have firebase initialized

export async function submitPhoneNumberFirestore(prevState: any, formData: FormData): Promise<SubmitResult> {
    // ... (validation code remains the same) ...

    // Check Firestore for existing phone number
    const q = query(collection(db, "submissions"), where("phoneNumber", "==", cleanPhoneNumber));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return { success: false, message: "This phone number has already submitted a selection.", fieldErrors: { phoneNumber: ["Duplicate submission."] } };
    }

    // Add new submission to Firestore
    try {
        await addDoc(collection(db, "submissions"), {
            phoneNumber: cleanPhoneNumber,
            selectedItems: validatedItems.data,
            timestamp: Timestamp.fromDate(new Date()),
        });
        console.log("Server Action: Added submission to Firestore");
        return { success: true, message: "Your selection has been recorded!" };
    } catch (error) {
        console.error("Server Action: Error saving to Firestore:", error);
        return { success: false, message: "Database error.", error: "database" };
    }
}
*/
