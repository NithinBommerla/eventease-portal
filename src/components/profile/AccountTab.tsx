
import { useState } from "react";
import { ProfileData } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  MapPin, 
  UserCircle,
  Upload,
  Globe,
  Users,
  Loader2,
  Map,
} from "lucide-react";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { countries } from "@/data/countries";
import { cities } from "@/data/cities";
import { DOBSelector } from "./DOBSelector";
import { PhoneInput } from "./PhoneInput";

interface AccountTabProps {
  profileData: ProfileData;
  isSubmitting: boolean;
  onSubmit: (data: ProfileData) => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const phoneRegex = /^\d{10}$/;

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  first_name: z.string().min(1, {
    message: "First name is required.",
  }),
  last_name: z.string().min(1, {
    message: "Last name is required.",
  }),
  bio: z.string().optional(),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal("")),
  dob: z.date().nullable().optional(),
  gender: z.string().min(1, "Please select a gender"),
  country: z.string().optional(),
  city: z.string().optional(),
  phone_number: z.string().regex(phoneRegex, {
    message: "Please enter a valid 10-digit phone number.",
  }).optional().or(z.literal("")),
  country_code: z.string().min(1, "Please select a country code"),
  address: z.string().optional(),
});

export const AccountTab = ({ 
  profileData, 
  isSubmitting, 
  onSubmit,
  onAvatarChange 
}: AccountTabProps) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profileData.avatar_url || null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profileData.username,
      email: profileData.email,
      first_name: profileData.first_name || "",
      last_name: profileData.last_name || "",
      bio: profileData.bio || "",
      website: profileData.website || "",
      dob: profileData.dob ? new Date(profileData.dob) : null,
      gender: profileData.gender || "Prefer not to say",
      country: profileData.country || "",
      city: profileData.city || "",
      phone_number: profileData.phone_number || "",
      country_code: profileData.country_code || "+1",
      address: profileData.address || ""
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    onAvatarChange(e);
  };

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...profileData,
      ...values,
      name: `${values.first_name} ${values.last_name}`.trim(),
      dob: values.dob ? values.dob.toISOString() : null,
    });
  };

  const getInitials = (firstName: string, lastName: string, username: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
  
  const selectedCountry = form.watch("country");
  const availableCities = selectedCountry ? cities[selectedCountry] || [] : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarPreview || undefined} alt="Profile Picture" />
              <AvatarFallback className="text-lg">
                {getInitials(
                  form.getValues("first_name"), 
                  form.getValues("last_name"), 
                  form.getValues("username")
                )}
              </AvatarFallback>
            </Avatar>
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Upload size={16} />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isSubmitting}
            />
          </div>
          <p className="text-xs text-gray-500">
            Click the icon to upload a profile picture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  Username
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your username" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  Email
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your email address" disabled={isSubmitting} />
                </FormControl>
                <FormDescription>
                  Changing your email requires verification
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-gray-500" />
                  First Name
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your first name" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-gray-500" />
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your last name" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormControl>
                  <DOBSelector 
                    value={field.value || null} 
                    onChange={field.onChange} 
                    disabled={isSubmitting} 
                  />
                </FormControl>
                <FormDescription>
                  Your date of birth helps personalize your experience
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-gray-500" />
                  Gender
                </FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    disabled={isSubmitting}
                  >
                    {genderOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  Country
                </FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      field.onChange(e);
                      form.setValue("city", "");
                    }}
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-gray-500" />
                  City
                </FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    disabled={isSubmitting || !selectedCountry}
                  >
                    <option value="">
                      {!selectedCountry 
                        ? "Select a country first" 
                        : availableCities.length > 0 
                          ? "Select a city" 
                          : "No cities available for this country"}
                    </option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-1 md:col-span-2">
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field: phoneField }) => (
                <FormField
                  control={form.control}
                  name="country_code"
                  render={({ field: codeField }) => (
                    <FormItem>
                      <FormControl>
                        <PhoneInput
                          phoneNumber={phoneField.value}
                          countryCode={codeField.value}
                          onPhoneNumberChange={phoneField.onChange}
                          onCountryCodeChange={codeField.onChange}
                          disabled={isSubmitting}
                          error={form.formState.errors.phone_number?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Address
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your address" disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                Website
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://yourwebsite.com" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-gray-500" />
                Bio
              </FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Tell us about yourself" 
                  disabled={isSubmitting}
                  className="resize-none min-h-24"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-start gap-6 py-2 px-4 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Followers:</span>
            <span className="text-sm">{profileData.followers_count || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Following:</span>
            <span className="text-sm">{profileData.following_count || 0}</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Saving...</span>
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </Form>
  );
};
