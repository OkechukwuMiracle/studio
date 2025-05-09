
"use server";

import { z } from "zod";

// In-memory store for submissions (replace with a database in production)
interface Submission {
  phoneNumber: string;
  selectedFood: string;
  selectedDrinks: string[];
  timestamp: Date;
  faceId?: string; // Unique identifier for the face scan
}
const submissions: Submission[] = [];

// Store for phone numbers that have successfully submitted, now also includes faceId
const successfulSubmissions = new Map<string, { submission: Submission; faceId: string }>();

// Store for faces that have been used, mapping faceId to phoneNumber
// faceId here will be the faceImageDataUri for simplicity in this example
const usedFaces = new Map<string, string>(); // faceId (data URI) -> phoneNumber


// Schemas
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format. Use E.164 (e.g., +1234567890).");
const foodSchema = z.string().min(1, "Please select a food item.");
const drinksSchema = z.array(z.string()).optional();
const faceScanSchema = z.string().optional(); // Data URI of the face scan

interface SuccessSubmission {
    phoneNumber: string;
    selectedFood: string;
    selectedDrinks?: string[];
    faceId?: string;
}

export interface SubmitResult {
  success: boolean;
  message: string;
  error?: 'validation' | 'database' | 'duplicate_phone' | 'duplicate_face_different_phone' | 'unknown';
  fieldErrors?: Record<string, string[]> | null;
  submission?: SuccessSubmission | null;
}

export async function submitPhoneNumber(prevState: SubmitResult | null, formData: FormData): Promise<SubmitResult> {
  const selectedFood = formData.get("selectedFood") as string | null;
  const selectedDrinksRaw = formData.getAll("selectedDrinks");
  const phoneNumber = formData.get("phoneNumber") as string | null;
  const faceScanDataUri = formData.get("faceScan") as string | null;


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
    // Optional, so not critical for form validity if parse fails unless specific rules are added
    console.warn("Invalid drinks selection format", validatedDrinks.error.flatten());
  }
  
  const validatedFaceScan = faceScanSchema.safeParse(faceScanDataUri);
  if (!validatedFaceScan.success || !faceScanDataUri) { // Face scan is required
      fieldErrors.faceScan = ["Face verification is required."];
      isValid = false;
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

  if (!isValid || !cleanPhoneNumber || !validatedFood.success || !faceScanDataUri) {
    return {
      success: false,
      message: "Validation failed. Please check the highlighted fields.",
      error: 'validation',
      fieldErrors,
      submission: null,
    };
  }

  const faceId = faceScanDataUri; // Using the Data URI as a simple ID. In real app, use hash or embedding.

  // Check 1: Duplicate Phone (current primary check)
  if (successfulSubmissions.has(cleanPhoneNumber)) {
    return {
      success: false,
      message: "This phone number has already been used to submit a selection.",
      error: 'duplicate_phone',
      fieldErrors: { phoneNumber: ["This phone number has already submitted a selection."] },
      submission: null,
    };
  }

  // Check 2: Face already used by a *different* phone number
  const phoneAssociatedWithFace = usedFaces.get(faceId);
  if (phoneAssociatedWithFace && phoneAssociatedWithFace !== cleanPhoneNumber) {
    return {
      success: false,
      message: "This face has already been used with a different phone number for a selection.",
      error: 'duplicate_face_different_phone',
      fieldErrors: { faceScan: ["This face is already linked to another phone number's selection."] },
      submission: null,
    };
  }


  try {
    const newSubmission: Submission = {
      phoneNumber: cleanPhoneNumber,
      selectedFood: validatedFood.data,
      selectedDrinks: validatedDrinks.data || [],
      timestamp: new Date(),
      faceId: faceId,
    };
    submissions.push(newSubmission);
    successfulSubmissions.set(cleanPhoneNumber, { submission: newSubmission, faceId: faceId });
    usedFaces.set(faceId, cleanPhoneNumber);


    const successData: SuccessSubmission = {
      phoneNumber: newSubmission.phoneNumber,
      selectedFood: newSubmission.selectedFood,
      selectedDrinks: newSubmission.selectedDrinks.length > 0 ? newSubmission.selectedDrinks : undefined,
      faceId: newSubmission.faceId,
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
      error: 'database', // Consider a more generic 'server_error'
      fieldErrors: null,
      submission: null,
    };
  }
}

    