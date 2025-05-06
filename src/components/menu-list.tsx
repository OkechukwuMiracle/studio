
"use client";

import type { ComponentProps } from "react";
import { useState, useEffect, useActionState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation'; // Import useRouter
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { submitPhoneNumber, type SubmitResult } from "@/app/actions"; // Import SubmitResult type
import { Utensils, GlassWater, ChefHat, Soup, CookingPot } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import Ofada from "@/assets/ofada.jpeg";
import Amala from "@/assets/amala.jpeg";
import Nkwobi from "@/assets/nkwobi.jpg";
import RamGrill from "@/assets/ram-grill.jpeg";
import MiyanKuka from "@/assets/miyan-kuka.jpg";
import IgboEgusi from "@/assets/egusi-soup.jpg";
import Masa from "@/assets/masa.jpg";
import JollofChicken from "@/assets/jollof-rice.jpg";
import BangaStarch from "@/assets/banga.jpg";
import PalmWine from "@/assets/palmwine.jpeg";
import Kunu from "@/assets/kunu.jpg";


interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: any;
  icon?: React.ElementType;
  // imageHint: string;
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

// Combined list for easy lookup by ID if needed elsewhere
export const allMenuItems = [...foodItems, ...drinkItems];


const FormSchema = z.object({
  selectedFood: z.string({ required_error: "Please select one food item." }), // Single required food item
  selectedDrinks: z.array(z.string()).optional(), // Optional array of drink items
  phoneNumber: z.string().optional(), // Keep phone number optional until needed
});

type FormData = z.infer<typeof FormSchema>;

// Use the imported SubmitResult type for initialState
const initialState: SubmitResult = {
  message: "",
  success: false,
  error: undefined,
  fieldErrors: null,
  submission: null, // Add submission data field
};

export function MenuList(props: ComponentProps<"form">) {
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      selectedFood: undefined, // No default food selected
      selectedDrinks: [], // Default to empty array for drinks
      phoneNumber: "",
    },
  });

  const [state, formAction, isActionPending] = useActionState(submitPhoneNumber, initialState);

  const watchedFood = form.watch("selectedFood");
  const watchedDrinks = form.watch("selectedDrinks"); // Watch drinks too, though less critical for logic here

  // Effect to trigger phone input visibility based on food selection
  useEffect(() => {
    if (watchedFood) {
      setShowPhoneInput(true);
    } else {
      setShowPhoneInput(false);
    }
  }, [watchedFood]);

  // Effect to handle redirection and toast messages
  useEffect(() => {
    if (state?.message) {
      // Handle redirection FIRST if needed
      if (state.success && state.submission) {
        const params = new URLSearchParams();
        params.set('food', state.submission.selectedFood);
        state.submission.selectedDrinks?.forEach(drink => params.append('drinks', drink));
        router.push(`/confirmation?${params.toString()}`);
        // No need for toast on success if redirecting immediately
        return; // Prevent further processing
      } else if (state.error === 'duplicate_phone') {
        router.push('/error/duplicate');
        // No need for toast on duplicate error if redirecting immediately
        return; // Prevent further processing
      }

      // Show toast for non-redirecting errors or informational messages
      toast({
        title: state.success ? "Success!" : "Error", // Should not hit success here due to redirect logic above
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });

      // Handle form field errors
      if (!state.success && state.fieldErrors) {
        for (const [field, errors] of Object.entries(state.fieldErrors)) {
          form.setError(field as keyof FormData, { message: errors[0] }); // Show first error
        }
      } else if (!state.success && state.error && !state.fieldErrors) {
        // Show general error if no specific field error
        form.setError("selectedFood", { message: state.message }); // Assign to a primary field
      }
    }
  }, [state, toast, form, router]);


   const handleFormSubmit = (formData: FormData) => {
     const data = new FormData();

     // Append selected food
     if (formData.selectedFood) {
       data.append("selectedFood", formData.selectedFood);
     } else {
       // This case should be caught by zod validation, but handle defensively
       form.setError("selectedFood", { message: "Please select a food item." });
       return;
     }

     // Append selected drinks (if any)
     formData.selectedDrinks?.forEach(drink => data.append("selectedDrinks", drink));

     // Append phone number if visible and provided
     if (showPhoneInput && !formData.phoneNumber) {
        form.setError("phoneNumber", { message: "Phone number is required to submit." });
        return;
     } else if (showPhoneInput && formData.phoneNumber) {
         data.append("phoneNumber", formData.phoneNumber);
     }

     formAction(data);
   };

   // Helper function to render food items (Radio Group)
   const renderFoodItems = (items: MenuItem[]) => (
     <>
       {/* <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Food (Select One)</h3> */}
        <FormField
          control={form.control}
          name="selectedFood"
          render={({ field }) => (
            <FormItem className="space-y-3">
                {/* Removed redundant FormLabel/Description - handled by h3 and overall form structure */}
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
                                     id={`food-${item.id}`} // Unique ID for radio item
                                     className="border-primary text-primary focus:ring-primary data-[state=checked]:border-primary"
                                     aria-labelledby={`label-food-${item.id}`}
                                    />
                                 </FormControl>
                               </CardHeader>
                               <CardContent className="flex items-center space-x-4 pt-2">
                                  <Image
                                    src={item.image}
                                    alt="" // Decorative
                                    width={50}
                                    height={50}
                                    className="rounded-full object-cover"
                                    // data-ai-hint={item.image}
                                  />
                                 <Label
                                    htmlFor={`food-${item.id}`} // Match radio item ID
                                    id={`label-food-${item.id}`} // Unique ID for label
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

   // Helper function to render drink items (Checkboxes)
   const renderDrinkItems = (items: MenuItem[]) => (
     <>
       <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Drinks (Optional)</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="selectedDrinks"
            render={({ field }) => ( // No need for outer FormItem, handled per checkbox
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
                           <Card className={`flex-1 transition-shadow duration-300 hover:shadow-lg ${isChecked ? 'ring-2 ring-secondary shadow-md' : ''}`}> {/* Use secondary color ring for drinks */}
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
                                    id={`drink-${item.id}`} // Unique ID
                                    className="border-secondary text-secondary focus:ring-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground" // Use secondary color for drinks
                                    aria-labelledby={`label-drink-${item.id}`}
                                  />
                                </FormControl>
                             </CardHeader>
                             <CardContent className="flex items-center space-x-4 pt-2">
                                <Image
                                  src={item.image}
                                  alt="" // Decorative
                                  width={50}
                                  height={50}
                                  className="rounded-full object-cover"
                                  // data-ai-hint={item.image}
                                />
                               <Label
                                  htmlFor={`drink-${item.id}`} // Match checkbox ID
                                  id={`label-drink-${item.id}`} // Unique ID
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
                  {/* Render FormMessage for selectedDrinks array if needed, though less common */}
                  {/* <FormMessage /> */}
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
         className="w-full max-w-2xl space-y-6"
         {...props}
        >
        <div className="space-y-3">
            {/* <h2 className="text-2xl font-semibold text-foreground">Choose Your Items</h2>
            <p className="text-muted-foreground">Select one food item and any optional drinks.</p> */}

            {renderFoodItems(foodItems)}
            <Separator className="my-6" />
            {renderDrinkItems(drinkItems)}

        </div>


        {/* Conditionally render Phone Number Input with Animation */}
         <motion.div
           initial={false}
           animate={{ height: showPhoneInput ? 'auto' : 0, opacity: showPhoneInput ? 1 : 0 }}
           transition={{ duration: 0.4, ease: "easeInOut" }}
           style={{ overflow: 'hidden' }}
         >
           {showPhoneInput && (
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
                        aria-invalid={!!form.formState.errors.phoneNumber}
                        aria-describedby="phoneNumber-error"
                      />
                   </FormControl>
                   <FormDescription>Used to ensure one selection per person.</FormDescription>
                   <FormMessage id="phoneNumber-error" />
                 </FormItem>
               )}
             />
           )}
         </motion.div>


          {/* Submit button appears when phone input is visible */}
          <motion.div
           initial={false}
           animate={{ height: showPhoneInput ? 'auto' : 0, opacity: showPhoneInput ? 1 : 0, marginTop: showPhoneInput ? '1.5rem' : '0' }}
           transition={{ duration: 0.4, ease: "easeInOut", delay: showPhoneInput ? 0.2 : 0 }}
           style={{ overflow: 'hidden' }}
          >
          {showPhoneInput && (
             <Button
                 type="submit"
                 className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 transition-transform duration-200 hover:scale-105 active:scale-95"
                 disabled={isActionPending}
                 aria-busy={isActionPending}
               >
                 {isActionPending ? "Submitting..." : "Submit Selection"}
               </Button>
             )}
           </motion.div>

      </form>
    </Form>
  );
}
