
"use client";

import type { ComponentProps } from "react";
import { useState, useEffect, useActionState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { submitPhoneNumber } from "@/app/actions";
import { Utensils, GlassWater, ChefHat, Soup, CookingPot } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  icon?: React.ElementType;
  imageHint: string;
  type: 'food' | 'drink'; // Add type property
}

// Separate food and drink items
const foodItems: MenuItem[] = [
  { id: "ofada", name: "Ofada Rice & Sauce", description: "Traditional spicy sauce with local rice.", icon: Utensils, imageHint: "african rice stew", type: "food" },
  { id: "amala", name: "Amala & Ewedu + Gbegiri", description: "Yam flour paste with bean and vegetable soups.", icon: Utensils, imageHint: "amala soup nigeria", type: "food" },
  { id: "nkwobi", name: "Nkwobi", description: "Spicy cow foot delicacy.", icon: ChefHat, imageHint: "nkwobi nigeria food", type: "food" },
  { id: "ram_grill", name: "Ram Grill", description: "Succulent grilled ram meat.", icon: ChefHat, imageHint: "grilled lamb meat", type: "food" },
  { id: "miyan_kuka", name: "Miyan Kuka", description: "Dried baobab leaves soup, a Hausa specialty.", icon: Soup, imageHint: "miyan kuka soup nigeria", type: "food" },
  { id: "igbo_egusi", name: "Igbo Egusi & Yellow Eba", description: "Melon seed soup served with cassava dough.", icon: Utensils, imageHint: "egusi soup eba nigeria", type: "food" },
  { id: "masa", name: "Masa", description: "Northern Nigerian rice cakes/pancakes.", icon: CookingPot, imageHint: "masa rice cake nigeria", type: "food" },
  { id: "jollof_chicken", name: "Jollof Rice & Chicken", description: "Classic Jollof rice with chicken and plantain.", icon: Utensils, imageHint: "jollof rice chicken plantain", type: "food" },
  { id: "banga_starch", name: "Banga and Starch", description: "Palm nut soup served with delta starch.", icon: Soup, imageHint: "banga soup starch delta nigeria", type: "food" },
];

const drinkItems: MenuItem[] = [
  { id: "palm_wine", name: "Palm Wine", description: "Traditional fermented palm sap drink.", icon: GlassWater, imageHint: "palm wine glass", type: "drink" },
  { id: "kunu", name: "Kunu", description: "Refreshing millet or sorghum drink.", icon: GlassWater, imageHint: "kunu drink nigeria", type: "drink" },
];

const allItems = [...foodItems, ...drinkItems]; // Combine for easy lookup if needed

const FormSchema = z.object({
  // Use z.array for multiple selections, ensure at least one item is selected
  selectedItems: z.array(z.string()).min(1, "Please select at least one item."),
  phoneNumber: z.string().optional(), // Keep phone number optional until needed
});

type FormData = z.infer<typeof FormSchema>;

const initialState = {
  message: "",
  success: false,
  error: undefined as string | undefined,
  fieldErrors: null as Record<string, string[]> | null, // To handle field-specific errors
};

export function MenuList(props: ComponentProps<"form">) {
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      selectedItems: [], // Default to empty array
      phoneNumber: "",
    },
  });

  const [state, formAction, isActionPending] = useActionState(submitPhoneNumber, initialState);

  const watchedItems = form.watch("selectedItems");

  // Effect to trigger phone input visibility based on selections
  useEffect(() => {
    if (watchedItems && watchedItems.length > 0) {
      setShowPhoneInput(true);
    } else {
      setShowPhoneInput(false);
      // Optionally reset phone number if no items are selected
      // form.resetField("phoneNumber");
    }
  }, [watchedItems, form]);

  // Effect to show toast messages and handle form errors
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
      } else {
        // Handle general errors or field-specific errors from server
        if (state.fieldErrors) {
          for (const [field, errors] of Object.entries(state.fieldErrors)) {
            form.setError(field as keyof FormData, { message: errors[0] }); // Show first error
          }
        } else if (state.error) {
          // If no specific field, show general error (though selectedItems might be appropriate)
           form.setError("selectedItems", { message: state.message });
        }
      }
    }
    // Do NOT clear errors here, let RHF handle it based on resolver
    // form.clearErrors();
  }, [state, toast, form]);

   const handleFormSubmit = (formData: FormData) => {
     const data = new FormData();
     // Append each selected item
     formData.selectedItems.forEach(item => data.append("selectedItems", item));

     if (showPhoneInput && !formData.phoneNumber) {
        form.setError("phoneNumber", { message: "Phone number is required to submit." });
        return;
     } else if (showPhoneInput && formData.phoneNumber) {
         data.append("phoneNumber", formData.phoneNumber);
     }

     // Schema validation handles the 'at least one item' check
     // if (formData.selectedItems.length === 0) { ... }

     formAction(data);
   };

   // Helper function to render menu items
   const renderMenuItems = (items: MenuItem[], category: 'Food' | 'Drinks') => (
     <>
       <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{category}</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {items.map((item, index) => {
           const Icon = item.icon;
           return (
             <motion.div
               key={item.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3, delay: index * 0.05 }} // Slightly faster stagger
             >
               <FormField
                 control={form.control}
                 name="selectedItems"
                 render={({ field }) => (
                   <FormItem key={item.id} className="flex items-center space-x-3 space-y-0">
                     <Card className={`flex-1 transition-shadow duration-300 hover:shadow-lg ${field.value?.includes(item.id) ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                       <CardHeader className="flex flex-row items-center justify-between pb-2">
                         <div className="flex items-center space-x-3">
                           {Icon && <Icon className="h-5 w-5 text-primary" aria-hidden="true" />}
                           <CardTitle className="text-lg">{item.name}</CardTitle>
                         </div>
                         <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    )
                              }}
                              id={item.id}
                              className="border-primary text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                              aria-labelledby={`label-${item.id}`} // Associate checkbox with label
                            />
                          </FormControl>
                       </CardHeader>
                       <CardContent className="flex items-center space-x-4 pt-2">
                          <Image
                            src={`https://picsum.photos/seed/${item.id}/100/100`}
                            alt="" // Decorative, label provides context
                            width={60}
                            height={60}
                            className="rounded-md object-cover"
                            data-ai-hint={item.imageHint}
                          />
                         <Label
                            htmlFor={item.id}
                            id={`label-${item.id}`} // ID for aria-labelledby
                            className="text-sm font-normal text-muted-foreground flex-1 cursor-pointer"
                          >
                           {item.description}
                         </Label>
                       </CardContent>
                     </Card>
                   </FormItem>
                 )}
               />
             </motion.div>
           );
         })}
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
        <FormField
          control={form.control}
          name="selectedItems" // Bind to the array field
          render={() => ( // We render items manually inside, but need the field for error handling
            <FormItem className="space-y-3">
              <FormLabel className="text-2xl font-semibold text-foreground">Choose Your Items</FormLabel>
              <FormDescription>Select one or more food and drink items.</FormDescription>

              {renderMenuItems(foodItems, 'Food')}
              <Separator className="my-6" />
              {renderMenuItems(drinkItems, 'Drinks')}

              {/* Display error message for the selectedItems array */}
              <FormMessage />
            </FormItem>
          )}
        />


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
