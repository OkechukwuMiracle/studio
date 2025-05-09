
// "use client";

// import type { ComponentProps } from "react";
// import { useState, useEffect, useActionState } from "react";
// import Image from "next/image";
// import { useRouter } from 'next/navigation';
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { motion } from "framer-motion";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { useToast } from "@/hooks/use-toast";
// import { submitPhoneNumber, type SubmitResult } from "@/app/actions";
// import { Utensils, GlassWater, ChefHat, Soup, CookingPot } from 'lucide-react';
// import { Separator } from "@/components/ui/separator";
// import Ofada from "@/assets/ofada-rice.jpg";
// import Amala from "@/assets/amala.jpeg";
// import Nkwobi from "@/assets/nkwobi.jpg";
// import RamGrill from "@/assets/ram-grill.jpeg";
// import MiyanKuka from "@/assets/miyan-kuka.jpg";
// import IgboEgusi from "@/assets/egusi-soup.jpg";
// import Masa from "@/assets/masa-cake.jpeg";
// import JollofChicken from "@/assets/jollof-rice.jpg";
// import BangaStarch from "@/assets/banga.jpg";
// import PalmWine from "@/assets/palmwine.jpeg";
// import Kunu from "@/assets/kunu-milk.jpg";


// interface MenuItem {
//   id: string;
//   name: string;
//   description: string;
//   image: any;
//   icon?: React.ElementType;
//   type: 'food' | 'drink';
// }

// const foodItems: MenuItem[] = [
//   { id: "ofada", name: "Ofada Rice & Sauce", description: "Traditional spicy sauce with local rice.", icon: Utensils, image: Ofada, type: "food" },
//   { id: "amala", name: "Amala & Ewedu + Gbegiri", description: "Yam flour paste with bean and vegetable soups.", icon: Utensils, image: Amala, type: "food" },
//   { id: "nkwobi", name: "Nkwobi", description: "Spicy cow foot delicacy.", icon: ChefHat, image: Nkwobi, type: "food" },
//   { id: "ram_grill", name: "Ram Grill", description: "Succulent grilled ram meat.", icon: ChefHat, image: RamGrill, type: "food" },
//   { id: "miyan_kuka", name: "Miyan Kuka", description: "Dried baobab leaves soup, a Hausa specialty.", icon: Soup, image: MiyanKuka, type: "food" },
//   { id: "igbo_egusi", name: "Igbo Egusi & Yellow Eba", description: "Melon seed soup served with cassava dough.", icon: Utensils, image: IgboEgusi, type: "food" },
//   { id: "masa", name: "Masa", description: "Northern Nigerian rice cakes/pancakes.", icon: CookingPot, image: Masa, type: "food" },
//   { id: "jollof_chicken", name: "Jollof Rice & Chicken", description: "Classic Jollof rice with chicken and plantain.", icon: Utensils, image: JollofChicken, type: "food" },
//   { id: "banga_starch", name: "Banga and Starch", description: "Palm nut soup served with delta starch.", icon: Soup, image: BangaStarch, type: "food" },
// ];

// const drinkItems: MenuItem[] = [
//   { id: "palm_wine", name: "Palm Wine", description: "Traditional fermented palm sap drink.", icon: GlassWater, image: PalmWine, type: "drink" },
//   { id: "kunu", name: "Kunu", description: "Refreshing millet or sorghum drink.", icon: GlassWater, image: Kunu, type: "drink" },
// ];

// export const allMenuItems = [...foodItems, ...drinkItems];


// const FormSchema = z.object({
//   selectedFood: z.string({ required_error: "Please select one food item." }),
//   selectedDrinks: z.array(z.string()).optional(),
//   phoneNumber: z.string().optional(),
//   otp: z.string().optional(), // OTP is optional in the schema, validated conditionally
// });

// type FormData = z.infer<typeof FormSchema>;

// const initialState: SubmitResult = {
//   message: "",
//   success: false,
//   error: undefined,
//   fieldErrors: null,
//   submission: null,
//   otpRequired: false,
//   phoneNumberForOtp: null,
// };

// export function MenuList(props: ComponentProps<"form">) {
//   const [showInitialPhoneInput, setShowInitialPhoneInput] = useState(false); // Renamed for clarity
//   const [otpStep, setOtpStep] = useState(false);
//   const [phoneNumberForOtp, setPhoneNumberForOtp] = useState<string | null>(null);
//   const { toast } = useToast();
//   const router = useRouter();

//   const form = useForm<FormData>({
//     resolver: zodResolver(FormSchema),
//     defaultValues: {
//       selectedFood: undefined,
//       selectedDrinks: [],
//       phoneNumber: "",
//       otp: "",
//     },
//   });

//   const [state, formAction, isActionPending] = useActionState(submitPhoneNumber, initialState);

//   const watchedFood = form.watch("selectedFood");

//   useEffect(() => {
//     if (watchedFood && !otpStep) { // Only show initial phone input if not in OTP step
//       setShowInitialPhoneInput(true);
//     } else if (!watchedFood && !otpStep) {
//       setShowInitialPhoneInput(false);
//     }
//   }, [watchedFood, otpStep]);

//   useEffect(() => {
//     if (state?.message) {
//       if (state.otpRequired && state.phoneNumberForOtp) {
//         setOtpStep(true);
//         setPhoneNumberForOtp(state.phoneNumberForOtp);
//         setShowInitialPhoneInput(false); // Hide initial phone input
//         form.resetField("otp"); // Clear OTP field for new entry
//         toast({
//           title: "OTP Sent",
//           description: state.message, // Message from server (includes simulated OTP in dev)
//           variant: "default",
//         });
//         return;
//       }

//       if (state.success && state.submission) {
//         const params = new URLSearchParams();
//         params.set('food', state.submission.selectedFood);
//         state.submission.selectedDrinks?.forEach(drink => params.append('drinks', drink));
//         router.push(`/confirmation?${params.toString()}`);
//         // Toast for success can be here or on confirmation page
//         toast({ title: "Success!", description: state.message, variant: "default" });
//         return;
//       }
      
//       if (state.error === 'duplicate_phone') {
//         router.push('/error/duplicate');
//         // No toast needed, page explains error
//         return;
//       }

//       if (state.error === 'otp_invalid' || state.error === 'otp_expired') {
//         setOtpStep(true); // Stay on OTP step or return to it
//         setPhoneNumberForOtp(state.phoneNumberForOtp || form.getValues("phoneNumber"));
//         toast({
//           title: "OTP Error",
//           description: state.message,
//           variant: "destructive",
//         });
//         if (state.fieldErrors?.otp) {
//             form.setError("otp", { message: state.fieldErrors.otp[0] });
//         }
//         form.resetField("otp");
//         // If OTP expired, we might want to reset to the beginning
//         if (state.error === 'otp_expired') {
//             setOtpStep(false);
//             setShowInitialPhoneInput(true); // Show phone input again
//             form.resetField("phoneNumber"); // Optionally clear phone number
//         }
//         return;
//       }

//       // General errors or validation messages for the initial step
//       toast({
//         title: state.success ? "Info" : "Error",
//         description: state.message,
//         variant: state.success ? "default" : "destructive",
//       });

//       if (!state.success && state.fieldErrors) {
//         for (const [field, errors] of Object.entries(state.fieldErrors)) {
//           if (field === "otp" && !otpStep) continue; // Don't set OTP error if not in OTP step
//           form.setError(field as keyof FormData, { message: errors[0] });
//         }
//       } else if (!state.success && state.error && !state.fieldErrors) {
//         form.setError("selectedFood", { message: state.message });
//       }
//     }
//   }, [state, toast, form, router, otpStep]);


//    const handleFormSubmit = (formData: FormData) => {
//      const data = new FormData();

//      data.append("selectedFood", formData.selectedFood || ""); // Ensure it's always present

//      formData.selectedDrinks?.forEach(drink => data.append("selectedDrinks", drink));

//      if (formData.phoneNumber) {
//         data.append("phoneNumber", formData.phoneNumber);
//      }

//      if (otpStep && formData.otp) {
//        data.append("otp", formData.otp);
//      } else if (otpStep && !formData.otp) {
//         form.setError("otp", { message: "OTP is required." });
//         return;
//      }

//      if (!otpStep && showInitialPhoneInput && !formData.phoneNumber) {
//         form.setError("phoneNumber", { message: "Phone number is required to submit." });
//         return;
//      }
     
//      formAction(data);
//    };

//    const renderFoodItems = (items: MenuItem[]) => (
//      <>
//         <FormField
//           control={form.control}
//           name="selectedFood"
//           render={({ field }) => (
//             <FormItem className="space-y-3">
//               <FormControl>
//                  <RadioGroup
//                     onValueChange={field.onChange}
//                     value={field.value}
//                     className="grid grid-cols-1 md:grid-cols-2 gap-4"
//                   >
//                    {items.map((item, index) => {
//                      const Icon = item.icon;
//                      return (
//                         <motion.div
//                            key={item.id}
//                            initial={{ opacity: 0, y: 20 }}
//                            animate={{ opacity: 1, y: 0 }}
//                            transition={{ duration: 0.3, delay: index * 0.05 }}
//                          >
//                            <FormItem className="flex items-center space-x-3 space-y-0 h-full">
//                              <Card className={`flex-1 transition-shadow duration-300 hover:shadow-lg ${field.value === item.id ? 'ring-2 ring-primary shadow-lg' : ''}`}>
//                                <CardHeader className="flex flex-row items-center justify-between pb-2">
//                                  <div className="flex items-center space-x-3">
//                                    {Icon && <Icon className="h-5 w-5 text-primary" aria-hidden="true" />}
//                                    <CardTitle className="text-lg">{item.name}</CardTitle>
//                                  </div>
//                                  <FormControl>
//                                    <RadioGroupItem
//                                      value={item.id}
//                                      id={`food-${item.id}`}
//                                      className="border-primary text-primary focus:ring-primary data-[state=checked]:border-primary"
//                                      aria-labelledby={`label-food-${item.id}`}
//                                     />
//                                  </FormControl>
//                                </CardHeader>
//                                <CardContent className="flex items-center space-x-4 pt-2">
//                                   <Image
//                                     src={item.image}
//                                     alt="" 
//                                     width={50}
//                                     height={50}
//                                     className="rounded-full object-cover"
//                                   />
//                                  <Label
//                                     htmlFor={`food-${item.id}`} 
//                                     id={`label-food-${item.id}`} 
//                                     className="text-sm font-normal text-muted-foreground flex-1 cursor-pointer"
//                                   >
//                                    {item.description}
//                                  </Label>
//                                </CardContent>
//                              </Card>
//                            </FormItem>
//                         </motion.div>
//                      );
//                    })}
//                  </RadioGroup>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//      </>
//    );

//    const renderDrinkItems = (items: MenuItem[]) => (
//      <>
//        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Drinks (Optional)</h3>
//        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormField
//             control={form.control}
//             name="selectedDrinks"
//             render={({ field }) => (
//                  <>
//                    {items.map((item, index) => {
//                      const Icon = item.icon;
//                      const isChecked = field.value?.includes(item.id);
//                      return (
//                        <motion.div
//                          key={item.id}
//                          initial={{ opacity: 0, y: 20 }}
//                          animate={{ opacity: 1, y: 0 }}
//                          transition={{ duration: 0.3, delay: index * 0.05 }}
//                        >
//                          <FormItem key={item.id} className="flex items-center space-x-3 space-y-0 h-full">
//                            <Card className={`flex-1 transition-shadow duration-300 hover:shadow-lg ${isChecked ? 'ring-2 ring-secondary shadow-md' : ''}`}>
//                              <CardHeader className="flex flex-row items-center justify-between pb-2">
//                                <div className="flex items-center space-x-3">
//                                  {Icon && <Icon className="h-5 w-5 text-secondary" aria-hidden="true" />}
//                                  <CardTitle className="text-lg">{item.name}</CardTitle>
//                                </div>
//                                <FormControl>
//                                   <Checkbox
//                                     checked={isChecked}
//                                     onCheckedChange={(checked) => {
//                                       return checked
//                                         ? field.onChange([...(field.value || []), item.id])
//                                         : field.onChange(
//                                             (field.value || [])?.filter(
//                                               (value) => value !== item.id
//                                             )
//                                           )
//                                     }}
//                                     id={`drink-${item.id}`}
//                                     className="border-secondary text-secondary focus:ring-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground"
//                                     aria-labelledby={`label-drink-${item.id}`}
//                                   />
//                                 </FormControl>
//                              </CardHeader>
//                              <CardContent className="flex items-center space-x-4 pt-2">
//                                 <Image
//                                   src={item.image}
//                                   alt=""
//                                   width={50}
//                                   height={50}
//                                   className="rounded-full object-cover"
//                                 />
//                                <Label
//                                   htmlFor={`drink-${item.id}`}
//                                   id={`label-drink-${item.id}`}
//                                   className="text-sm font-normal text-muted-foreground flex-1 cursor-pointer"
//                                 >
//                                  {item.description}
//                                </Label>
//                              </CardContent>
//                            </Card>
//                          </FormItem>
//                        </motion.div>
//                      );
//                    })}
//                 </>
//               )}
//           />
//        </div>
//      </>
//    );


//   return (
//     <Form {...form}>
//       <form
//          onSubmit={form.handleSubmit(handleFormSubmit)}
//          className="w-full space-y-6"
//          {...props}
//         >

//         {!otpStep && (
//           <div className="space-y-3">
//             {renderFoodItems(foodItems)}
//             <Separator className="my-6" />
//             {renderDrinkItems(drinkItems)}
//           </div>
//         )}
        
//         {/* Hidden fields for OTP step to carry over selections */}
//         {otpStep && (
//             <>
//                 <input type="hidden" {...form.register("selectedFood")} value={form.getValues("selectedFood")} />
//                 {form.getValues("selectedDrinks")?.map((drinkId, index) => (
//                     <input key={index} type="hidden" value={drinkId} {...form.register(`selectedDrinks.${index}` as const)} />
//                 ))}
//                  <input type="hidden" {...form.register("phoneNumber")} value={form.getValues("phoneNumber")} />
//             </>
//         )}


//         {/* Initial Phone Input (visible if food selected and not in OTP step) */}
//         <motion.div
//            initial={false}
//            animate={{ height: showInitialPhoneInput && !otpStep ? 'auto' : 0, opacity: showInitialPhoneInput && !otpStep ? 1 : 0 }}
//            transition={{ duration: 0.4, ease: "easeInOut" }}
//            style={{ overflow: 'hidden' }}
//          >
//            {showInitialPhoneInput && !otpStep && (
//              <FormField
//                control={form.control}
//                name="phoneNumber"
//                render={({ field }) => (
//                  <FormItem className="pt-4">
//                    <FormLabel htmlFor="phoneNumber" className="text-lg font-medium">Enter Your Phone Number</FormLabel>
//                    <FormControl>
//                      <Input
//                         id="phoneNumber"
//                         {...field}
//                         type="tel"
//                         placeholder="+1234567890"
//                         className="transition-colors duration-300 focus:border-primary focus:ring-primary"
//                         aria-required="true"
//                       />
//                    </FormControl>
//                    <FormDescription>Used to ensure one selection per person and for OTP.</FormDescription>
//                    <FormMessage />
//                  </FormItem>
//                )}
//              />
//            )}
//          </motion.div>

//         {/* OTP Input (visible if in OTP step) */}
//         <motion.div
//             initial={false}
//             animate={{ height: otpStep ? 'auto' : 0, opacity: otpStep ? 1 : 0 }}
//             transition={{ duration: 0.4, ease: "easeInOut" }}
//             style={{ overflow: 'hidden' }}
//         >
//             {otpStep && phoneNumberForOtp && (
//                 <div className="pt-4 space-y-3">
//                     <p className="text-lg font-medium text-center">
//                         An OTP was sent to <span className="font-bold">{phoneNumberForOtp}</span>.
//                     </p>
//                     <FormField
//                         control={form.control}
//                         name="otp"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel htmlFor="otp" className="text-lg font-medium">Enter OTP</FormLabel>
//                                 <FormControl>
//                                     <Input
//                                         id="otp"
//                                         {...field}
//                                         type="text"
//                                         placeholder="123456"
//                                         maxLength={6}
//                                         className="transition-colors duration-300 focus:border-primary focus:ring-primary text-center text-xl tracking-widest"
//                                         aria-required="true"
//                                     />
//                                 </FormControl>
//                                 <FormDescription>Enter the 6-digit code.</FormDescription>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>
//             )}
//         </motion.div>


//         {/* Submit Button Area */}
//         <motion.div
//            initial={false}
//            animate={{ 
//                height: (showInitialPhoneInput && !otpStep) || otpStep ? 'auto' : 0, 
//                opacity: (showInitialPhoneInput && !otpStep) || otpStep ? 1 : 0, 
//                marginTop: (showInitialPhoneInput && !otpStep) || otpStep ? '1.5rem' : '0' 
//             }}
//            transition={{ duration: 0.4, ease: "easeInOut", delay: (showInitialPhoneInput && !otpStep) || otpStep ? 0.2 : 0 }}
//            style={{ overflow: 'hidden' }}
//           >
//           {((showInitialPhoneInput && !otpStep) || otpStep) && (
//              <Button
//                  type="submit"
//                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 transition-transform duration-200 hover:scale-105 active:scale-95"
//                  disabled={isActionPending}
//                  aria-busy={isActionPending}
//                >
//                  {isActionPending ? "Submitting..." : (otpStep ? "Verify OTP & Submit" : "Submit Selection")}
//                </Button>
//              )}
//            </motion.div>
//       </form>
//     </Form>
//   );
// }









"use client";

import type { ComponentProps } from "react";
import { useState, useEffect, useActionState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

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
  image: any;
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
  phoneNumber: z.string().optional(),
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
  const [showInitialPhoneInput, setShowInitialPhoneInput] = useState(false); // Renamed for clarity
  const [otpStep, setOtpStep] = useState(false);
  const [phoneNumberForOtp, setPhoneNumberForOtp] = useState<string | null>(null);
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
    if (watchedFood && !otpStep) { // Only show initial phone input if not in OTP step
      setShowInitialPhoneInput(true);
    } else if (!watchedFood && !otpStep) {
      setShowInitialPhoneInput(false);
    }
  }, [watchedFood, otpStep]);

  useEffect(() => {
    if (state?.message) {
      if (state.otpRequired && state.phoneNumberForOtp) {
        setOtpStep(true);
        setPhoneNumberForOtp(state.phoneNumberForOtp);
        setShowInitialPhoneInput(false); // Hide initial phone input
        form.resetField("otp"); // Clear OTP field for new entry
        toast({
          title: "OTP Sent",
          description: state.message, // Message from server (includes simulated OTP in dev)
          variant: "default",
        });
        return;
      }

      if (state.success && state.submission) {
        const params = new URLSearchParams();
        params.set('food', state.submission.selectedFood);
        state.submission.selectedDrinks?.forEach(drink => params.append('drinks', drink));
        router.push(`/confirmation?${params.toString()}`);
        // Toast for success can be here or on confirmation page
        toast({ title: "Success!", description: state.message, variant: "default" });
        return;
      }
      
      if (state.error === 'duplicate_phone') {
        router.push('/error/duplicate');
        // No toast needed, page explains error
        return;
      }

      if (state.error === 'otp_invalid' || state.error === 'otp_expired') {
        setOtpStep(true); // Stay on OTP step or return to it
        setPhoneNumberForOtp(state.phoneNumberForOtp || form.getValues("phoneNumber"));
        toast({
          title: "OTP Error",
          description: state.message,
          variant: "destructive",
        });
        if (state.fieldErrors?.otp) {
            form.setError("otp", { message: state.fieldErrors.otp[0] });
        }
        form.resetField("otp");
        // If OTP expired, we might want to reset to the beginning
        if (state.error === 'otp_expired') {
            setOtpStep(false);
            setShowInitialPhoneInput(true); // Show phone input again
            form.resetField("phoneNumber"); // Optionally clear phone number
        }
        return;
      }

      // General errors or validation messages for the initial step
      toast({
        title: state.success ? "Info" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });

      if (!state.success && state.fieldErrors) {
        for (const [field, errors] of Object.entries(state.fieldErrors)) {
          if (field === "otp" && !otpStep) continue; // Don't set OTP error if not in OTP step
          form.setError(field as keyof FormData, { message: errors[0] });
        }
      } else if (!state.success && state.error && !state.fieldErrors) {
        form.setError("selectedFood", { message: state.message });
      }
    }
  }, [state, toast, form, router, otpStep]);


   const handleFormSubmit = (formData: FormData) => {
     const data = new FormData();

     data.append("selectedFood", formData.selectedFood || ""); // Ensure it's always present

     formData.selectedDrinks?.forEach(drink => data.append("selectedDrinks", drink));

     if (formData.phoneNumber) {
        data.append("phoneNumber", formData.phoneNumber);
     }

     if (otpStep && formData.otp) {
       data.append("otp", formData.otp);
     } else if (otpStep && !formData.otp) {
        form.setError("otp", { message: "OTP is required." });
        return;
     }

     if (!otpStep && showInitialPhoneInput && !formData.phoneNumber) {
        form.setError("phoneNumber", { message: "Phone number is required to submit." });
        return;
     }
     
     formAction(data);
   };

   const renderFoodItems = (items: MenuItem[]) => (
     <>
        <FormField
          control={form.control}
          name="selectedFood"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                 <RadioGroup
                    onValueChange={field.onChange}
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
                             <Card className={`flex-1 transition-shadow duration-300 hover:shadow-lg ${field.value === item.id ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                               <CardHeader className="flex flex-row items-center justify-between pb-2">
                                 <div className="flex items-center space-x-3">
                                   {Icon && <Icon className="h-5 w-5 text-primary" aria-hidden="true" />}
                                   <CardTitle className="text-lg">{item.name}</CardTitle>
                                 </div>
                                 <FormControl>
                                   <RadioGroupItem
                                     value={item.id}
                                     id={`food-${item.id}`}
                                     className="border-primary text-primary focus:ring-primary data-[state=checked]:border-primary"
                                     aria-labelledby={`label-food-${item.id}`}
                                    />
                                 </FormControl>
                               </CardHeader>
                               <CardContent className="flex items-center space-x-4 pt-2">
                                  <Image
                                    src={item.image}
                                    alt="" 
                                    width={50}
                                    height={50}
                                    className="rounded-full object-cover"
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
       <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Drinks (Optional)</h3>
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
                           <Card className={`flex-1 transition-shadow duration-300 hover:shadow-lg ${isChecked ? 'ring-2 ring-secondary shadow-md' : ''}`}>
                             <CardHeader className="flex flex-row items-center justify-between pb-2">
                               <div className="flex items-center space-x-3">
                                 {Icon && <Icon className="h-5 w-5 text-secondary" aria-hidden="true" />}
                                 <CardTitle className="text-lg">{item.name}</CardTitle>
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
                                  alt=""
                                  width={50}
                                  height={50}
                                  className="rounded-full object-cover"
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
      <form
         onSubmit={form.handleSubmit(handleFormSubmit)}
         className="w-full space-y-6"
         {...props}
        >

        {!otpStep && (
          <div className="space-y-3">
            {renderFoodItems(foodItems)}
            <Separator className="my-6" />
            {renderDrinkItems(drinkItems)}
          </div>
        )}
        
        {/* Hidden fields for OTP step to carry over selections */}
        {otpStep && (
            <>
                <input type="hidden" {...form.register("selectedFood")} value={form.getValues("selectedFood")} />
                {form.getValues("selectedDrinks")?.map((drinkId, index) => (
                    <input key={index} type="hidden" value={drinkId} {...form.register(`selectedDrinks.${index}` as const)} />
                ))}
                 <input type="hidden" {...form.register("phoneNumber")} value={form.getValues("phoneNumber")} />
            </>
        )}


        {/* Initial Phone Input (visible if food selected and not in OTP step) */}
        <motion.div
           initial={false}
           animate={{ height: showInitialPhoneInput && !otpStep ? 'auto' : 0, opacity: showInitialPhoneInput && !otpStep ? 1 : 0 }}
           transition={{ duration: 0.4, ease: "easeInOut" }}
           style={{ overflow: 'hidden' }}
         >
           {showInitialPhoneInput && !otpStep && (
             <FormField
               control={form.control}
               name="phoneNumber"
               render={({ field }) => (
                 <FormItem className="pt-4">
                   <FormLabel htmlFor="phoneNumber" className="text-lg font-medium">Enter Your Phone Number</FormLabel>
                   <FormControl>
                     <Input
                        id="phoneNumber"
                        {...field}
                        type="tel"
                        placeholder="+1234567890"
                        className="transition-colors duration-300 focus:border-primary focus:ring-primary"
                        aria-required="true"
                      />
                   </FormControl>
                   <FormDescription>Used to ensure one selection per person and for OTP.</FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />
           )}
         </motion.div>

        {/* OTP Input (visible if in OTP step) */}
        <motion.div
            initial={false}
            animate={{ height: otpStep ? 'auto' : 0, opacity: otpStep ? 1 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ overflow: 'hidden' }}
        >
            {otpStep && phoneNumberForOtp && (
                <div className="pt-4 space-y-3">
                    <p className="text-lg font-medium text-center">
                        An OTP was sent to <span className="font-bold">{phoneNumberForOtp}</span>.
                    </p>
                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="otp" className="text-lg font-medium">Enter OTP</FormLabel>
                                <FormControl>
                                    <Input
                                        id="otp"
                                        {...field}
                                        type="text"
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


        {/* Submit Button Area */}
        <motion.div
           initial={false}
           animate={{ 
               height: (showInitialPhoneInput && !otpStep) || otpStep ? 'auto' : 0, 
               opacity: (showInitialPhoneInput && !otpStep) || otpStep ? 1 : 0, 
               marginTop: (showInitialPhoneInput && !otpStep) || otpStep ? '1.5rem' : '0' 
            }}
           transition={{ duration: 0.4, ease: "easeInOut", delay: (showInitialPhoneInput && !otpStep) || otpStep ? 0.2 : 0 }}
           style={{ overflow: 'hidden' }}
          >
          {((showInitialPhoneInput && !otpStep) || otpStep) && (
             <Button
                 type="submit"
                 className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 transition-transform duration-200 hover:scale-105 active:scale-95"
                 disabled={isActionPending}
                 aria-busy={isActionPending}
               >
                 {isActionPending ? "Submitting..." : (otpStep ? "Verify OTP & Submit" : "Submit Selection")}
               </Button>
             )}
           </motion.div>
      </form>
    </Form>
  );
}
