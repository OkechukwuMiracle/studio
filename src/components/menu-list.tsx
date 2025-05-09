
"use client";

import type { ComponentProps } from "react";
import { useState, useEffect, useRef } from "react";
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
  phoneNumber: z.string().min(1, "Phone number is required.").regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format. Use E.164 (e.g., +1234567890)."),
});

type FormData = z.infer<typeof FormSchema>;

const initialState: SubmitResult = {
  message: "",
  success: false,
  error: undefined,
  fieldErrors: null,
  submission: null,
};

export function MenuList(props: ComponentProps<"form">) {
  const [showInitialPhoneInput, setShowInitialPhoneInput] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      selectedFood: undefined,
      selectedDrinks: [],
      phoneNumber: "",
    },
  });

  const [state, formAction, isActionPending] = useActionState(submitPhoneNumber, initialState);


  const watchedFood = form.watch("selectedFood");

  useEffect(() => {
    if (watchedFood) {
      setShowInitialPhoneInput(true);
    } else {
      setShowInitialPhoneInput(false);
    }
  }, [watchedFood]);


  const handleFormSubmit = (formDataValues: FormData) => {
    const submissionFormData = new FormData();
    submissionFormData.append("selectedFood", formDataValues.selectedFood);
    formDataValues.selectedDrinks?.forEach(drink => submissionFormData.append("selectedDrinks", drink));
    submissionFormData.append("phoneNumber", formDataValues.phoneNumber);

    formAction(submissionFormData);
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
                        if (value) setShowInitialPhoneInput(true);
                        else setShowInitialPhoneInput(false);
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
        
        <motion.div
           initial={false}
           animate={{ 
             height: showInitialPhoneInput ? 'auto' : 0, 
             opacity: showInitialPhoneInput ? 1 : 0,
             marginTop: showInitialPhoneInput ? '2rem' : '0',
             display: showInitialPhoneInput ? 'block' : 'none',
            }}
           transition={{ duration: 0.4, ease: "easeInOut" }}
           style={{ overflow: 'hidden' }}
         >
           {showInitialPhoneInput && (
             <FormField
               control={form.control}
               name="phoneNumber"
               render={({ field }) => (
                 <FormItem className="pt-4 border-t border-border">
                   <FormLabel htmlFor="phoneNumber" className="text-lg font-semibold text-foreground">Enter Your Phone Number</FormLabel>
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
                   <FormDescription>Your phone number is required to submit your selection.</FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />
           )}
         </motion.div>

        <motion.div
           initial={false}
           animate={{ 
               height: showInitialPhoneInput ? 'auto' : 0, 
               opacity: showInitialPhoneInput ? 1 : 0, 
               marginTop: showInitialPhoneInput ? '2rem' : '0',
               display: showInitialPhoneInput ? 'block' : 'none',
            }}
           transition={{ duration: 0.4, ease: "easeInOut", delay: 0.1 }}
           style={{ overflow: 'hidden' }}
          >
          {showInitialPhoneInput && ( 
             <Button
                 type="submit"
                 className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg transition-transform duration-200 hover:scale-105 active:scale-95 rounded-lg shadow-md"
                 disabled={isActionPending} 
                 aria-busy={isActionPending}
               >
                 {isActionPending ? "Processing..." : "Submit Selection"}
               </Button>
             )}
           </motion.div>
      </form>
    </Form>
  );
}
