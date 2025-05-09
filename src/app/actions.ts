// "use server";

// import { RecaptchaVerifier, type ConfirmationResult } from "firebase/auth";
// import { sendOTP, verifyOTP } from "@/lib/firebase";
// import { z } from "zod";

// // In-memory store for submissions (replace with a database in production)
// interface Submission {
//   phoneNumber: string;
//   selectedFood: string;
//   selectedDrinks: string[];
//   timestamp: Date;
// }
// const submissions: Submission[] = [];
// const submittedPhoneNumbers = new Map<string, Submission>();

// // In-memory store for pending OTPs (replace with a database in production)
// // Changed to Record<string, ConfirmationResult>
// const pendingOtps: Record<string, ConfirmationResult> = {};

// // Schemas
// const phoneSchema = z
//   .string()
//   .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format. Use E.164 (e.g., +1234567890).");
// const foodSchema = z.string().min(1, "Please select a food item.");
// const drinksSchema = z.array(z.string()).optional();
// const otpSchema = z.string().length(6, "OTP must be 6 digits.");

// interface SuccessSubmission {
//   phoneNumber: string;
//   selectedFood: string;
//   selectedDrinks?: string[];
// }

// export interface SubmitResult {
//   success: boolean;
//   message: string;
//   error?:
//     | "validation"
//     | "database"
//     | "duplicate_phone"
//     | "otp_invalid"
//     | "otp_expired"
//     | "unknown";
//   fieldErrors?: Record<string, string[]> | null;
//   submission?: SuccessSubmission | null;
//   otpRequired?: boolean;
//   phoneNumberForOtp?: string | null;
// }

// // Combined action for submitting phone number and verifying OTP
// export async function submitPhoneNumber(
//   prevState: SubmitResult | null,
//   formData: FormData
// ): Promise<SubmitResult> {
//   const selectedFood = formData.get("selectedFood") as string | null;
//   const selectedDrinksRaw = formData.getAll("selectedDrinks");
//   const phoneNumber = formData.get("phoneNumber") as string | null;
//   const otp = formData.get("otp") as string | null;
//   const recaptchaVerifier = JSON.parse(formData.get("recaptchaVerifier") as string);

//   // Ensure selectedDrinks is always an array of strings
//   const selectedDrinks = Array.isArray(selectedDrinksRaw)
//     ? selectedDrinksRaw.filter((d) => typeof d === "string")
//     : typeof selectedDrinksRaw === "string"
//     ? [selectedDrinksRaw]
//     : [];

//   console.log("Server Action: Received data:", {
//     selectedFood,
//     selectedDrinks,
//     phoneNumber,
//     otp,
//   });

//   let fieldErrors: Record<string, string[]> = {};
//   let isValid = true;

//   // --- OTP Verification Step ---
//   if (otp) {
//     const validatedOtp = otpSchema.safeParse(otp);
//     if (!validatedOtp.success) {
//       return {
//         success: false,
//         message: "Invalid OTP format.",
//         error: "otp_invalid",
//         fieldErrors: { otp: validatedOtp.error.flatten().formErrors },
//         submission: null,
//         otpRequired: true,
//         phoneNumberForOtp: phoneNumber,
//       };
//     }

//     if (!phoneNumber) {
//       return {
//         success: false,
//         message: "Phone number is missing for OTP verification.",
//         error: "validation",
//         fieldErrors: { phoneNumber: ["Phone number is required."] },
//         submission: null,
//         otpRequired: true,
//         phoneNumberForOtp: null,
//       };
//     }

//     const confirmationResult = pendingOtps[phoneNumber];

//     if (!confirmationResult) {
//         return {
//             success: false,
//             message: "No pending OTP found for this number.",
//             error: "otp_invalid",
//             fieldErrors: { otp: ["Invalid OTP."] },
//             submission: null,
//             otpRequired: true,
//             phoneNumberForOtp: phoneNumber,
//           };
//     }
//     try {
//         const isOtpValid = await verifyOTP(confirmationResult, validatedOtp.data);
//         if (isOtpValid) {
//           const newSubmission: Submission = {
//             phoneNumber: phoneNumber,
//             selectedFood: "", // You might need to store this when sending the OTP
//             selectedDrinks: [], // You might need to store this when sending the OTP
//             timestamp: new Date(),
//           };
    
//           //retrieve the selected food and the selected drinks before deleting the pending OTP
//           if (phoneNumber in pendingOtps) {
//             newSubmission.selectedFood = (pendingOtps[phoneNumber] as any).selectedFood;
//             newSubmission.selectedDrinks = (pendingOtps[phoneNumber] as any).selectedDrinks;
//           }

//           submissions.push(newSubmission);
//           submittedPhoneNumbers.set(phoneNumber, newSubmission);
//           delete pendingOtps[phoneNumber]; // OTP used, remove it
    
//           console.log("Server Action: Added submission after OTP:", newSubmission);
    
//           const successData: SuccessSubmission = {
//             phoneNumber: newSubmission.phoneNumber,
//             selectedFood: newSubmission.selectedFood,
//             selectedDrinks: newSubmission.selectedDrinks.length > 0 ? newSubmission.selectedDrinks : undefined,
//           };
//           return {
//             success: true,
//             message: "Your selection has been recorded after OTP verification!",
//             submission: successData,
//             error: undefined,
//             fieldErrors: null,
//             otpRequired: false,
//           };
//         } else {
//           return {
//             success: false,
//             message: "Invalid OTP. Please try again.",
//             error: "otp_invalid",
//             fieldErrors: { otp: ["Invalid OTP."] },
//             submission: null,
//             otpRequired: true,
//             phoneNumberForOtp: phoneNumber,
//           };
//         }
//       } catch (error) {
//         console.error("Server Action: Error verifying OTP:", error);
//         return {
//           success: false,
//           message: "An unexpected error occurred during OTP verification.",
//           error: "otp_invalid",
//           fieldErrors: { otp: ["Error verifying OTP."] },
//           submission: null,
//           otpRequired: true,
//           phoneNumberForOtp: phoneNumber,
//         };
//       }
//   }

//   // --- Initial Submission Step (Collect Phone, Food, Drinks; Send OTP) ---
//   const validatedFood = foodSchema.safeParse(selectedFood);
//   if (!validatedFood.success) {
//     fieldErrors.selectedFood = validatedFood.error.flatten().formErrors;
//     isValid = false;
//   }

//   const validatedDrinks = drinksSchema.safeParse(selectedDrinks);
//   if (!validatedDrinks.success) {
//     console.warn(
//       "Server Action: Invalid drinks selection format",
//       validatedDrinks.error.flatten()
//     );
//   }

//   let cleanPhoneNumber: string | null = null;
//   if (!phoneNumber) {
//     fieldErrors.phoneNumber = ["Phone number is required."];
//     isValid = false;
//   } else {
//     const validatedPhone = phoneSchema.safeParse(phoneNumber);
//     if (!validatedPhone.success) {
//       fieldErrors.phoneNumber = validatedPhone.error.flatten().formErrors;
//       isValid = false;
//     } else {
//       cleanPhoneNumber = validatedPhone.data;
//     }
//   }

//   if (!isValid || !cleanPhoneNumber || !validatedFood.success) {
//     return {
//       success: false,
//       message: "Validation failed. Please check the highlighted fields.",
//       error: "validation",
//       fieldErrors,
//       submission: null,
//       otpRequired: false,
//     };
//   }

//   if (submittedPhoneNumbers.has(cleanPhoneNumber)) {
//     return {
//       success: false,
//       message: "This phone number has already been used to submit a selection.",
//       error: "duplicate_phone",
//       fieldErrors: {
//         phoneNumber: ["This phone number has already submitted a selection."],
//       },
//       submission: null,
//       otpRequired: false,
//     };
//   }

//   // Send OTP using Firebase
//   try {
//     const confirmationResult = await sendOTP(cleanPhoneNumber, recaptchaVerifier);
//     pendingOtps[cleanPhoneNumber] = confirmationResult;
//     //Store the selected food and selected drinks before sending the OTP
//     (pendingOtps[cleanPhoneNumber] as any).selectedFood = validatedFood.data;
//     (pendingOtps[cleanPhoneNumber] as any).selectedDrinks = validatedDrinks.data || [];

//     return {
//       success: false, // Not a final success yet, OTP step is next
//       message: "An OTP has been sent to your phone number.",
//       otpRequired: true,
//       phoneNumberForOtp: cleanPhoneNumber,
//       error: undefined,
//       fieldErrors: null,
//       submission: null,
//     };
//   } catch (error) {
//     console.error("Server Action: Error sending OTP:", error);
//     return {
//       success: false,
//       message: "Failed to send OTP. Please try again.",
//       otpRequired: false,
//       phoneNumberForOtp: null,
//       error: "unknown",
//       fieldErrors: null,
//       submission: null,
//     };
//   }
// }







// "use server";

// import { z } from "zod";

// // In-memory store for submissions (replace with a database in production)
// interface Submission {
//   phoneNumber: string;
//   selectedFood: string;
//   selectedDrinks: string[];
//   timestamp: Date;
// }
// const submissions: Submission[] = [];
// const submittedPhoneNumbers = new Map<string, Submission>();

// // In-memory store for pending OTPs
// interface PendingOtpEntry {
//   otp: string;
//   selectedFood: string;
//   selectedDrinks: string[];
//   timestamp: Date;
// }
// const pendingOtps = new Map<string, PendingOtpEntry>();

// // Schemas
// const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format. Use E.164 (e.g., +1234567890).");
// const foodSchema = z.string().min(1, "Please select a food item.");
// const drinksSchema = z.array(z.string()).optional();
// const otpSchema = z.string().length(6, "OTP must be 6 digits.");

// interface SuccessSubmission {
//     phoneNumber: string;
//     selectedFood: string;
//     selectedDrinks?: string[];
// }

// export interface SubmitResult {
//   success: boolean;
//   message: string;
//   error?: 'validation' | 'database' | 'duplicate_phone' | 'otp_invalid' | 'otp_expired' | 'unknown';
//   fieldErrors?: Record<string, string[]> | null;
//   submission?: SuccessSubmission | null;
//   otpRequired?: boolean;
//   phoneNumberForOtp?: string | null;
// }

// // Combined action for submitting phone number and verifying OTP
// export async function submitPhoneNumber(prevState: SubmitResult | null, formData: FormData): Promise<SubmitResult> {
//   const selectedFood = formData.get("selectedFood") as string | null;
//   const selectedDrinksRaw = formData.getAll("selectedDrinks"); // This will be string[] or string if only one
//   const phoneNumber = formData.get("phoneNumber") as string | null;
//   const otp = formData.get("otp") as string | null;

//   // Ensure selectedDrinks is always an array of strings
//   const selectedDrinks = Array.isArray(selectedDrinksRaw) ? selectedDrinksRaw.filter(d => typeof d === 'string') as string[] : (typeof selectedDrinksRaw === 'string' ? [selectedDrinksRaw] : []);


//   console.log("Server Action: Received data:", { selectedFood, selectedDrinks, phoneNumber, otp });

//   let fieldErrors: Record<string, string[]> = {};
//   let isValid = true;

//   // --- OTP Verification Step ---
//   if (otp) {
//     const validatedOtp = otpSchema.safeParse(otp);
//     if (!validatedOtp.success) {
//       return {
//         success: false,
//         message: "Invalid OTP format.",
//         error: 'otp_invalid',
//         fieldErrors: { otp: validatedOtp.error.flatten().formErrors },
//         submission: null,
//         otpRequired: true,
//         phoneNumberForOtp: phoneNumber,
//       };
//     }

//     if (!phoneNumber) {
//         return {
//             success: false,
//             message: "Phone number is missing for OTP verification.",
//             error: 'validation',
//             fieldErrors: { phoneNumber: ["Phone number is required."] },
//             submission: null,
//             otpRequired: true,
//             phoneNumberForOtp: null,
//         }
//     }

//     const pendingEntry = pendingOtps.get(phoneNumber);
//     if (!pendingEntry || pendingEntry.otp !== validatedOtp.data) {
//       // Basic OTP expiry (e.g., 5 minutes) - can be enhanced
//       if (pendingEntry && (new Date().getTime() - pendingEntry.timestamp.getTime()) > 5 * 60 * 1000) {
//         pendingOtps.delete(phoneNumber); // Remove expired OTP
//         return {
//             success: false,
//             message: 'OTP has expired. Please try submitting your selection again.',
//             error: 'otp_expired',
//             fieldErrors: { otp: ['OTP expired.'] },
//             submission: null,
//             otpRequired: false, // Go back to initial step
//             phoneNumberForOtp: phoneNumber,
//         };
//       }
//       return {
//         success: false,
//         message: 'Invalid OTP. Please try again.',
//         error: 'otp_invalid',
//         fieldErrors: { otp: ['Invalid OTP.'] },
//         submission: null,
//         otpRequired: true,
//         phoneNumberForOtp: phoneNumber,
//       };
//     }

//     // OTP is valid, proceed to save submission
//     try {
//       const newSubmission: Submission = {
//         phoneNumber: phoneNumber,
//         selectedFood: pendingEntry.selectedFood,
//         selectedDrinks: pendingEntry.selectedDrinks,
//         timestamp: new Date(),
//       };
//       submissions.push(newSubmission);
//       submittedPhoneNumbers.set(phoneNumber, newSubmission);
//       pendingOtps.delete(phoneNumber); // OTP used, remove it

//       console.log("Server Action: Added submission after OTP:", newSubmission);

//       const successData: SuccessSubmission = {
//         phoneNumber: newSubmission.phoneNumber,
//         selectedFood: newSubmission.selectedFood,
//         selectedDrinks: newSubmission.selectedDrinks.length > 0 ? newSubmission.selectedDrinks : undefined,
//       };

//       return {
//         success: true,
//         message: "Your selection has been recorded after OTP verification!",
//         submission: successData,
//         error: undefined,
//         fieldErrors: null,
//         otpRequired: false,
//       };
//     } catch (error) {
//       console.error("Server Action: Error saving submission after OTP:", error);
//       return {
//         success: false,
//         message: "An unexpected error occurred. Please try again.",
//         error: 'database',
//         fieldErrors: null,
//         submission: null,
//         otpRequired: true, // Stay on OTP step if DB error
//         phoneNumberForOtp: phoneNumber,
//       };
//     }
//   }

//   // --- Initial Submission Step (Collect Phone, Food, Drinks; Send OTP) ---
//   const validatedFood = foodSchema.safeParse(selectedFood);
//   if (!validatedFood.success) {
//     fieldErrors.selectedFood = validatedFood.error.flatten().formErrors;
//     isValid = false;
//   }

//   const validatedDrinks = drinksSchema.safeParse(selectedDrinks);
//   if (!validatedDrinks.success) {
//     // Optional, so not strictly invalidating, but good to log
//     console.warn("Server Action: Invalid drinks selection format", validatedDrinks.error.flatten());
//   }

//   let cleanPhoneNumber: string | null = null;
//   if (!phoneNumber) {
//     fieldErrors.phoneNumber = ["Phone number is required."];
//     isValid = false;
//   } else {
//     const validatedPhone = phoneSchema.safeParse(phoneNumber);
//     if (!validatedPhone.success) {
//       fieldErrors.phoneNumber = validatedPhone.error.flatten().formErrors;
//       isValid = false;
//     } else {
//       cleanPhoneNumber = validatedPhone.data;
//     }
//   }

//   if (!isValid || !cleanPhoneNumber || !validatedFood.success) {
//     return {
//       success: false,
//       message: "Validation failed. Please check the highlighted fields.",
//       error: 'validation',
//       fieldErrors,
//       submission: null,
//       otpRequired: false,
//     };
//   }

//   if (submittedPhoneNumbers.has(cleanPhoneNumber)) {
//     return {
//       success: false,
//       message: "This phone number has already been used to submit a selection.",
//       error: 'duplicate_phone',
//       fieldErrors: { phoneNumber: ["This phone number has already submitted a selection."] },
//       submission: null,
//       otpRequired: false,
//     };
//   }

//   // Generate and store OTP
//   const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
//   pendingOtps.set(cleanPhoneNumber, {
//     otp: generatedOtp,
//     selectedFood: validatedFood.data,
//     selectedDrinks: validatedDrinks.data || [],
//     timestamp: new Date(),
//   });

//   console.log(`Server Action: OTP for ${cleanPhoneNumber}: ${generatedOtp} (Simulated SMS)`);

//   const otpMessage = process.env.NODE_ENV === 'development'
//     ? `An OTP has been sent to ${cleanPhoneNumber}. Please enter it to confirm. (Simulated OTP: ${generatedOtp})`
//     : `An OTP has been sent to ${cleanPhoneNumber}. Please enter it to confirm.`;

//   return {
//     success: false, // Not a final success yet, OTP step is next
//     message: otpMessage,
//     otpRequired: true,
//     phoneNumberForOtp: cleanPhoneNumber,
//     error: undefined,
//     fieldErrors: null,
//     submission: null,
//   };
// }








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