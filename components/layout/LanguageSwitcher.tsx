"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

interface LanguageSwitcherProps {
  currentLocale?: string;
  onChange?: (locale: string) => void;
  className?: string;
}

export function LanguageSwitcher({ currentLocale = "en", onChange, className }: LanguageSwitcherProps) {
  const [locale, setLocale] = useState(currentLocale);

  const handleChange = (code: string) => {
    setLocale(code);
    onChange?.(code);
  };

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Languages className="h-4 w-4" />
          <span className="text-xs">{current.flag} {current.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
       <DropdownMenuContent align="end">
         <DropdownMenuGroup>
           {LANGUAGES.map((lang) => (
             <DropdownMenuItem
               key={lang.code}
               onClick={() => handleChange(lang.code)}
             >
               <span>{lang.flag}</span>
               <span>{lang.label}</span>
             </DropdownMenuItem>
           ))}
         </DropdownMenuGroup>
       </DropdownMenuContent>
    </DropdownMenu>
  );
}
