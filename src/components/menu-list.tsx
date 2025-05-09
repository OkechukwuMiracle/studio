
"use client";

import type { ComponentProps } from "react";
import { useState, useEffect, useRef } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useActionState } from "react"; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { submitPhoneNumber, type SubmitResult } from "@/app/actions";
import { Utensils, GlassWater, ChefHat, Soup, CookingPot } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import Ofada from "@/assets/ofada-rice.jpg";
import Amala from "@/assets/amala.jpeg";
import Nkwobi from "@/assets/nkwobi.jpg";
import RamGrill from "@/assets/ram-grill.jpeg";
import MiyanKuka from "@/assets/miyan-kuka.jpg";
import IgboEgusi from "@/assets/egusi-soup.jpg";
import Masa from "@/assets/masa-cake.jpeg";
import JollofChicken from "@/assets/jollof-rice.jpg";
import BangaStarch from "@/assets/banga.jpg";
import PalmWine from "@/assets/palmwine.jpeg";
import Kunu from "@/assets/kunu-milk.jpg";


interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: any; // Should be StaticImageData or string
  icon?: React.ElementType;
  type: 'food' | 'drink';
}

const foodItems: MenuItem[] = [
  { id: "ofada", name: "Ofada Rice & Sauce", description: "Traditional spicy sauce with local rice.", icon: Utensils, image: Ofada, type: "food" },
  { id: "amala", name: "Amala & Ewedu + Gbegiri", description: "Yam flour paste with bean and vegetable soups.", icon: Utensils, image: Amala, type: "food" },
  { id: "nkwobi", name: "Nkwobi", description: "Spicy cow foot delicacy.", icon: ChefHat, image: Nkwobi, type: "food" },
  { id: "ram_grill", name: "Ram Grill", description: "Succulent grilled ram meat.", icon: ChefHat, image: RamGrill, type: "food" },
  { id: "miyan_kuka", name: "Miyan Kuka", description: "Dried baobab leaves soup, a Hausa specialty.", icon: Soup, image: MiyanKuka, type: "food" },
  { id: "igbo_egusi", name: "Igbo Egusi & Yellow Eba", description: "Melon seed soup served with cassava dough.", icon: Utensils, image: IgboEgusi, type: "food" },
  { id: "masa", name: "Masa", description: "Northern Nigerian rice cakes/pancakes.", icon: CookingPot, image: Masa, type: "food" },
  { id: "jollof_chicken", name: "Jollof Rice & Chicken", description: "Classic Jollof rice with chicken and plantain.", icon: Utensils, image: JollofChicken, type: "food" },
  { id: "banga_starch", name: "Banga and Starch", description: "Palm nut soup served with delta starch.", icon: Soup, image: BangaStarch, type: "food" },
];

const drinkItems: MenuItem[] = [
  { id: "palm_wine", name: "Palm Wine", description: "Traditional fermented palm sap drink.", icon: GlassWater, image: PalmWine, type: "drink" },
  { id: "kunu", name: "Kunu", description: "Refreshing millet or sorghum drink.", icon: GlassWater, image: Kunu, type: "drink" },
];

export const allMenuItems = [...foodItems, ...drinkItems];


const FormSchema = z.object({
  selectedFood: z.string({ required_error: "Please select one food item." }),
  selectedDrinks: z.array(z.string()).optional(),
  phoneNumber: z.string().optional(), // Optional because it's shown conditionally
  otp: z.string().optional(), // OTP is optional in the schema, validated conditionally
});

type FormData = z.infer<typeof FormSchema>;

const initialState: SubmitResult = {
  message: "",
  success: false,
  error: undefined,
  fieldErrors: null,
  submission: null,
  otpRequired: false,
  phoneNumberForOtp: null,
};

export function MenuList(props: ComponentProps<"form">) {
  const [showInitialPhoneInput, setShowInitialPhoneInput] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [phoneNumberForOtpState, setPhoneNumberForOtpState] = useState<string | null>(null); 
  const [confirmationResultState, setConfirmationResultState] = useState<any>(null); 

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null); 

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      selectedFood: undefined,
      selectedDrinks: [],
      phoneNumber: "",
      otp: "",
    },
  });

  const [state, formAction, isActionPending] = useActionState(submitPhoneNumber, initialState);


  const watchedFood = form.watch("selectedFood");

  useEffect(() => {
    if (watchedFood && !otpStep) {
      setShowInitialPhoneInput(true);
    } else if (!watchedFood && !otpStep) {
      setShowInitialPhoneInput(false);
    }
  }, [watchedFood, otpStep]);


  // Initialize reCAPTCHA
  useEffect(() => {
    if (typeof window !== 'undefined' && auth && recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
      try {
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response: any) => {
            console.log("reCAPTCHA solved:", response);
          },
          'expired-callback': () => {
            console.warn("reCAPTCHA expired");
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null; 
            }
          }
        });
        recaptchaVerifierRef.current = verifier;
      } catch (error) {
        console.error("Error initializing RecaptchaVerifier:", error);
        toast({
          title: "Setup Error",
          description: "Could not initialize security check. Please refresh.",
          variant: "destructive",
        });
      }
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
      }
    };
  }, []); 


  const sendOtp = async (phoneNumberInput: string) => {
    if (!recaptchaVerifierRef.current) {
      toast({
        title: "Verification Error",
        description: "Security verifier not ready. Please wait or refresh.",
        variant: "destructive",
      });
      return { success: false, error: "recaptcha-not-ready" };
    }
    try {
      const formattedPhoneNumber = phoneNumberInput.startsWith('+') ? phoneNumberInput : `+${phoneNumberInput}`; 
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifierRef.current);
      setConfirmationResultState(confirmation);
      setOtpStep(true);
      setPhoneNumberForOtpState(formattedPhoneNumber);
      setShowInitialPhoneInput(false); 
      form.resetField("otp"); 
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to ${formattedPhoneNumber}.`,
        variant: "default",
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let toastMessage = "An unexpected error occurred while sending the OTP. Please try again.";
      let returnError = error.message || "otp-send-error";

      if (error.code === 'auth/billing-not-enabled') {
        toastMessage = "The OTP service is currently unavailable. Please try again later or contact support.";
        returnError = 'auth/billing-not-enabled';
      } else if (error.code === 'auth/invalid-phone-number') {
        toastMessage = "The phone number format is invalid. Please ensure it includes the country code (e.g., +1234567890).";
        returnError = 'auth/invalid-phone-number';
      } else if (error.code === 'auth/too-many-requests') {
        toastMessage = "Too many OTP requests. Please wait a while before trying again.";
        returnError = 'auth/too-many-requests';
      } else if (error.message) {
        toastMessage = error.message;
      }

      toast({
        title: "OTP Error",
        description: toastMessage,
        variant: "destructive",
      });
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.render().catch(console.error);
      }
      return { success: false, error: returnError };
    }
  };


  const handleFormSubmit = async (formDataValues: FormData) => {
    if (!formDataValues.selectedFood) {
        form.setError("selectedFood", { message: "Please select a food item before submitting." });
        return;
    }

    if (otpStep) { 
      if (!formDataValues.otp) {
        form.setError("otp", { message: "OTP is required." });
        return;
      }
      if (!confirmationResultState) {
        toast({ title: "Error", description: "OTP confirmation not found. Please try sending OTP again.", variant: "destructive" });
        setOtpStep(false); 
        setShowInitialPhoneInput(true);
        return;
      }
      try {
        await confirmationResultState.confirm(formDataValues.otp);
        const submissionFormData = new FormData();
        submissionFormData.append("selectedFood", form.getValues("selectedFood") || "");
        form.getValues("selectedDrinks")?.forEach(drink => submissionFormData.append("selectedDrinks", drink));
        submissionFormData.append("phoneNumber", phoneNumberForOtpState || ""); 

        formAction(submissionFormData); 

      } catch (error: any) {
        console.error("Error verifying OTP:", error);
        form.setError("otp", { message: error.code === 'auth/invalid-verification-code' ? "Invalid OTP. Please try again." : "Failed to verify OTP." });
        toast({
          title: "OTP Verification Failed",
          description: error.code === 'auth/invalid-verification-code' ? "The OTP you entered is incorrect." : "An error occurred during OTP verification.",
          variant: "destructive",
        });
      }
    } else if (showInitialPhoneInput) { 
      if (!formDataValues.phoneNumber) {
        form.setError("phoneNumber", { message: "Phone number is required to get OTP." });
        return;
      }
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formDataValues.phoneNumber)) {
          form.setError("phoneNumber", { message: "Invalid phone number format. Use E.164 (e.g., +1234567890)." });
          return;
      }
      await sendOtp(formDataValues.phoneNumber);
    }
  };

   useEffect(() => {
    if (state?.message) { 
      if (state.success && state.submission) {
        const params = new URLSearchParams();
        params.set('food', state.submission.selectedFood);
        state.submission.selectedDrinks?.forEach(drink => params.append('drinks', drink));
        router.push(`/confirmation?${params.toString()}`);
        toast({ title: "Success!", description: state.message, variant: "default" });
        return;
      }

      if (state.error === 'duplicate_phone') {
        router.push('/error/duplicate');
        return;
      }
      
      toast({
        title: "Submission Error",
        description: state.message,
        variant: "destructive",
      });

      if (!state.success && state.fieldErrors) {
        for (const [field, errors] of Object.entries(state.fieldErrors)) {
          form.setError(field as keyof FormData, { message: errors[0] });
        }
      }
    }
  }, [state, toast, form, router]);


   const renderFoodItems = (items: MenuItem[]) => (
     <>
        <FormField
          control={form.control}
          name="selectedFood"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-xl font-semibold text-foreground">Choose Your Main Dish</FormLabel>
              <FormControl>
                 <RadioGroup
                    onValueChange={(value) => {
                        field.onChange(value);
                        if (value && !otpStep) setShowInitialPhoneInput(true);
                        else if (!value && !otpStep) setShowInitialPhoneInput(false);
                    }}
                    value={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                   {items.map((item, index) => {
                     const Icon = item.icon;
                     return (
                        <motion.div
                           key={item.id}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.3, delay: index * 0.05 }}
                         >
                           <FormItem className="flex items-center space-x-3 space-y-0 h-full">
                             <Card className={`flex-1 transition-shadow duration-300 hover:shadow-lg ${field.value === item.id ? 'ring-2 ring-primary shadow-lg border-primary' : 'border-border'}`}>
                               <CardHeader className="flex flex-row items-center justify-between pb-2">
                                 <div className="flex items-center space-x-3">
                                   {Icon && <Icon className="h-5 w-5 text-primary" aria-hidden="true" />}
                                   <CardTitle className="text-lg font-medium text-card-foreground">{item.name}</CardTitle>
                                 </div>
                                 <FormControl>
                                   <RadioGroupItem
                                     value={item.id}
                                     id={`food-${item.id}`}
                                     className="border-primary text-primary focus:ring-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                     aria-labelledby={`label-food-${item.id}`}
                                    />
                                 </FormControl>
                               </CardHeader>
                               <CardContent className="flex items-center space-x-4 pt-2">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={60}
                                    height={60}
                                    className="rounded-md object-cover shadow-sm aspect-square"
                                    data-ai-hint="food item"
                                  />
                                 <Label
                                    htmlFor={`food-${item.id}`}
                                    id={`label-food-${item.id}`}
                                    className="text-sm font-normal text-muted-foreground flex-1 cursor-pointer"
                                  >
                                   {item.description}
                                 </Label>
                               </CardContent>
                             </Card>
                           </FormItem>
                        </motion.div>
                     );
                   })}
                 </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
     </>
   );

   const renderDrinkItems = (items: MenuItem[]) => (
     <>
       <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Add Drinks (Optional)</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="selectedDrinks"
            render={({ field }) => (
                 <>
                   {items.map((item, index) => {
                     const Icon = item.icon;
                     const isChecked = field.value?.includes(item.id);
                     return (
                       <motion.div
                         key={item.id}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.3, delay: index * 0.05 }}
                       >
                         <FormItem key={item.id} className="flex items-center space-x-3 space-y-0 h-full">
                           <Card className={`flex-1 transition-shadow duration-300 hover:shadow-lg ${isChecked ? 'ring-2 ring-secondary shadow-md border-secondary' : 'border-border'}`}>
                             <CardHeader className="flex flex-row items-center justify-between pb-2">
                               <div className="flex items-center space-x-3">
                                 {Icon && <Icon className="h-5 w-5 text-secondary" aria-hidden="true" />}
                                 <CardTitle className="text-lg font-medium text-card-foreground">{item.name}</CardTitle>
                               </div>
                               <FormControl>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item.id])
                                        : field.onChange(
                                            (field.value || [])?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                    }}
                                    id={`drink-${item.id}`}
                                    className="border-secondary text-secondary focus:ring-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground"
                                    aria-labelledby={`label-drink-${item.id}`}
                                  />
                                </FormControl>
                             </CardHeader>
                             <CardContent className="flex items-center space-x-4 pt-2">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={60}
                                  height={60}
                                  className="rounded-md object-cover shadow-sm aspect-square"
                                  data-ai-hint="drink item"
                                />
                               <Label
                                  htmlFor={`drink-${item.id}`}
                                  id={`label-drink-${item.id}`}
                                  className="text-sm font-normal text-muted-foreground flex-1 cursor-pointer"
                                >
                                 {item.description}
                               </Label>
                             </CardContent>
                           </Card>
                         </FormItem>
                       </motion.div>
                     );
                   })}
                </>
              )}
          />
       </div>
     </>
   );


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="w-full space-y-8" {...props}>
        <div id="recaptcha-container" ref={recaptchaContainerRef} className="fixed bottom-0 right-0"></div>

        {!otpStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {renderFoodItems(foodItems)}
            <Separator className="my-8" />
            {renderDrinkItems(drinkItems)}
          </motion.div>
        )}
        
        {otpStep && (
            <>
                <input type="hidden" {...form.register("selectedFood")} />
                {form.getValues("selectedDrinks")?.map((drinkId, index) => (
                    <input key={index} type="hidden" value={drinkId} {...form.register(`selectedDrinks.${index}` as const)} />
                ))}
            </>
        )}


        <motion.div
           initial={false}
           animate={{ 
             height: showInitialPhoneInput && !otpStep ? 'auto' : 0, 
             opacity: showInitialPhoneInput && !otpStep ? 1 : 0,
             marginTop: showInitialPhoneInput && !otpStep ? '2rem' : '0',
             display: showInitialPhoneInput && !otpStep ? 'block' : 'none',
            }}
           transition={{ duration: 0.4, ease: "easeInOut" }}
           style={{ overflow: 'hidden' }}
         >
           {showInitialPhoneInput && !otpStep && (
             <FormField
               control={form.control}
               name="phoneNumber"
               render={({ field }) => (
                 <FormItem className="pt-4 border-t border-border">
                   <FormLabel htmlFor="phoneNumber" className="text-lg font-semibold text-foreground">Enter Your Phone Number for OTP</FormLabel>
                   <FormControl>
                     <Input
                        id="phoneNumber"
                        {...field}
                        type="tel"
                        placeholder="+1234567890 (with country code)"
                        className="transition-colors duration-300 focus:border-primary focus:ring-primary text-base"
                        aria-required="true"
                      />
                   </FormControl>
                   <FormDescription>We&apos;ll send a one-time password to this number.</FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />
           )}
         </motion.div>

        <motion.div
            initial={false}
            animate={{ 
                height: otpStep ? 'auto' : 0, 
                opacity: otpStep ? 1 : 0,
                display: otpStep ? 'block' : 'none',
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ overflow: 'hidden' }}
        >
            {otpStep && phoneNumberForOtpState && (
                <div className="pt-6 border-t border-border space-y-4">
                    <p className="text-lg font-semibold text-center text-foreground">
                        An OTP was sent to <span className="font-bold text-primary">{phoneNumberForOtpState}</span>.
                    </p>
                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="otp" className="text-lg font-semibold text-foreground">Enter OTP</FormLabel>
                                <FormControl>
                                    <Input
                                        id="otp"
                                        {...field}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="\d{6}"
                                        placeholder="123456"
                                        maxLength={6}
                                        className="transition-colors duration-300 focus:border-primary focus:ring-primary text-center text-xl tracking-widest"
                                        aria-required="true"
                                    />
                                </FormControl>
                                <FormDescription>Enter the 6-digit code.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </motion.div>


        <motion.div
           initial={false}
           animate={{ 
               height: (showInitialPhoneInput && !otpStep) || otpStep ? 'auto' : 0, 
               opacity: (showInitialPhoneInput && !otpStep) || otpStep ? 1 : 0, 
               marginTop: (showInitialPhoneInput && !otpStep) || otpStep ? '2rem' : '0',
               display: (showInitialPhoneInput && !otpStep) || otpStep ? 'block' : 'none',
            }}
           transition={{ duration: 0.4, ease: "easeInOut", delay: 0.1 }}
           style={{ overflow: 'hidden' }}
          >
          {((showInitialPhoneInput && !otpStep) || otpStep) && ( 
             <Button
                 type="submit"
                 className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg transition-transform duration-200 hover:scale-105 active:scale-95 rounded-lg shadow-md"
                 disabled={isActionPending} 
                 aria-busy={isActionPending}
               >
                 {isActionPending ? "Processing..." : (otpStep ? "Verify OTP & Submit Selection" : "Get OTP to Submit")}
               </Button>
             )}
           </motion.div>
      </form>
    </Form>
  );
}

    
