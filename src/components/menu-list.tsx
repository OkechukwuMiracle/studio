
"use client";

import type { ComponentProps } from "react";
import { useState, useEffect, useTransition, useActionState } from "react"; // Import useActionState
import Image from "next/image";
import { useForm } from "react-hook-form";
// Removed import { useFormState } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion"; // Import motion for animations

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { submitPhoneNumber } from "@/app/actions";
import { Utensils, GlassWater, ChefHat } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  icon?: React.ElementType;
  imageHint: string;
}

const menuItems: MenuItem[] = [
  { id: "ofada", name: "Ofada Rice & Sauce", description: "Traditional spicy sauce with local rice.", icon: Utensils, imageHint: "african rice stew" },
  { id: "amala", name: "Amala & Ewedu + Gbegiri", description: "Yam flour paste with bean and vegetable soups.", icon: Utensils, imageHint: "amala soup nigeria" },
  { id: "nkwobi", name: "Nkwobi", description: "Spicy cow foot delicacy.", icon: ChefHat, imageHint: "nkwobi nigeria food" },
  { id: "ram_grill", name: "Ram Grill", description: "Succulent grilled ram meat.", icon: ChefHat, imageHint: "grilled lamb meat" },
  { id: "palm_wine", name: "Palm Wine", description: "Traditional fermented palm sap drink.", icon: GlassWater, imageHint: "palm wine glass" },
  { id: "kunu", name: "Kunu", description: "Refreshing millet or sorghum drink.", icon: GlassWater, imageHint: "kunu drink nigeria" },
];

const FormSchema = z.object({
  selectedMeal: z.string({
    required_error: "Please select a meal.",
  }),
  phoneNumber: z.string().optional(), // Make phone number optional initially
});

type FormData = z.infer<typeof FormSchema>;

const initialState = {
  message: "",
  success: false,
  error: undefined as string | undefined, // Explicitly type error
};

export function MenuList(props: ComponentProps<"form">) {
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      selectedMeal: "",
      phoneNumber: "",
    },
  });

  // Use useActionState for handling server action response
  const [state, formAction, isActionPending] = useActionState(submitPhoneNumber, initialState);

  // Watch for changes in selectedMeal form value
   const watchedMeal = form.watch("selectedMeal");

  // Effect to trigger phone input visibility and reset state
  useEffect(() => {
    if (watchedMeal && watchedMeal !== selectedMeal) {
      setSelectedMeal(watchedMeal);
      setShowPhoneInput(true);
      // Reset server action state when meal changes - useActionState handles this better
      // if (state.message) { ... } // No longer needed
    }
  }, [watchedMeal, selectedMeal]);


  // Effect to show toast messages based on server action state
  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? "Success!" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
         form.reset(); // Reset form on success
         setShowPhoneInput(false);
         setSelectedMeal(null);
         // Resetting state is handled internally by useActionState on next action
      } else if (state.error === 'phoneNumber') {
         form.setError("phoneNumber", { message: state.message });
      } else if (state.error === 'meal') {
         form.setError("selectedMeal", {message: state.message});
      }
    }
     // Clear previous errors when input changes
     form.clearErrors();
  }, [state, toast, form]);

   // Wrapper function to include selectedMeal in FormData for the action
   const handleFormSubmit = (formData: FormData) => {
     const data = new FormData();
     data.append("selectedMeal", formData.selectedMeal);

     if (showPhoneInput && !formData.phoneNumber) {
        form.setError("phoneNumber", { message: "Phone number is required to submit." });
        return; // Prevent submission if phone is required but empty
     } else if (showPhoneInput && formData.phoneNumber) {
         data.append("phoneNumber", formData.phoneNumber);
     }

     if (!formData.selectedMeal) {
         form.setError("selectedMeal", { message: "Please select a meal first." });
         return; // Prevent submission if no meal selected
     }

     // useActionState handles the pending state, but useTransition can still be used
     // for finer-grained control if needed elsewhere.
     // Using the pending state from useActionState directly for the button.
     formAction(data);

     // Example using startTransition if needed for other UI updates:
     // startTransition(() => {
     //   formAction(data);
     // });
   };

  return (
    <Form {...form}>
      <form
         onSubmit={form.handleSubmit(handleFormSubmit)}
         className="w-full max-w-2xl space-y-6"
         {...props}
        >
        <FormField
          control={form.control}
          name="selectedMeal"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-2xl font-semibold text-foreground">Choose Your Meal</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value); // Update form state
                  }}
                  value={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  // Add aria-labelledby to associate the group with its label
                  aria-labelledby="meal-label"
                >
                 <span id="meal-label" className="sr-only">Choose Your Meal</span>
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                     <motion.div
                       key={item.id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.3, delay: index * 0.1 }} // Staggered animation
                     >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                         <Card className={`flex-1 transition-shadow duration-300 hover:shadow-lg ${field.value === item.id ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                           <CardHeader className="flex flex-row items-center justify-between pb-2">
                             <div className="flex items-center space-x-3">
                               {Icon && <Icon className="h-5 w-5 text-primary" aria-hidden="true" />}
                               <CardTitle className="text-lg">{item.name}</CardTitle>
                             </div>
                             <FormControl>
                                <RadioGroupItem value={item.id} id={item.id} className="border-primary text-primary focus:ring-primary"/>
                             </FormControl>
                           </CardHeader>
                           <CardContent className="flex items-center space-x-4 pt-2">
                              <Image
                                src={`https://picsum.photos/seed/${item.id}/100/100`}
                                alt="" // Alt text provided by Label
                                width={60}
                                height={60}
                                className="rounded-md object-cover"
                                data-ai-hint={item.imageHint}
                              />
                             <Label htmlFor={item.id} className="text-sm font-normal text-muted-foreground flex-1 cursor-pointer">
                               {item.name}: {item.description} {/* Combined name and description for better context */}
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

        {/* Conditionally render Phone Number Input with Animation */}
         <motion.div
           initial={false} // Don't animate on initial load
           animate={{ height: showPhoneInput ? 'auto' : 0, opacity: showPhoneInput ? 1 : 0 }}
           transition={{ duration: 0.4, ease: "easeInOut" }}
           style={{ overflow: 'hidden' }} // Hide content when collapsed
         >
           {/* Render content only when expanded to avoid potential focus issues */}
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
                        aria-invalid={!!form.formState.errors.phoneNumber} // Indicate invalid state
                        aria-describedby="phoneNumber-error" // Link to error message
                      />
                   </FormControl>
                   <FormMessage id="phoneNumber-error" /> {/* Ensure ID matches aria-describedby */}
                 </FormItem>
               )}
             />
           )}
         </motion.div>


          {/* Submit button only appears when phone input is visible */}
          <motion.div
           initial={false}
           animate={{ height: showPhoneInput ? 'auto' : 0, opacity: showPhoneInput ? 1 : 0, marginTop: showPhoneInput ? '1.5rem' : '0' }} // Adjust margin
           transition={{ duration: 0.4, ease: "easeInOut", delay: showPhoneInput ? 0.2 : 0 }} // Delay appearance
           style={{ overflow: 'hidden' }}
          >
          {showPhoneInput && (
             <Button
                 type="submit"
                 className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 transition-transform duration-200 hover:scale-105 active:scale-95"
                 disabled={isActionPending} // Use pending state from useActionState
                 aria-busy={isActionPending} // Indicate busy state
               >
                 {isActionPending ? "Submitting..." : "Submit Selection"}
               </Button>
             )}
           </motion.div>

      </form>
    </Form>
  );
}

    