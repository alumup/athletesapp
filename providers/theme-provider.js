"use client";
import React, { useState, useEffect, useContext } from "react";
import { createClient } from "@/lib/supabase/client"
import { Raleway, Playfair_Display, Inter } from "next/font/google";
import { useParams } from "next/navigation";
import tinycolor from "tinycolor2";

const raleway = Raleway({ subsets: ["latin"] });
const playfair = Playfair_Display({ style: ["italic"], subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export const ThemeContext = React.createContext();

function ThemeProvider({ site, children }) {
  const params = useParams();
  const supabase = createClient();

  const [theme, setTheme] = useState({
    colors: {},
    fonts: {
      "font-primary": raleway.style.fontFamily,
      "font-secondary": playfair.style.fontFamily,
      "font-tertiary": inter.style.fontFamily,
    },
  });

  function getCSSVariable(varName) {
    const rootStyle = getComputedStyle(document.documentElement);
    return rootStyle.getPropertyValue(varName).trim();
  }

  const applyTheme = (theme) => {
    const themeElements = document.querySelectorAll(".theme");
    themeElements.forEach((themeElement) => {
      for (const variable in theme?.colors) {
        themeElement.style.setProperty(`--${variable}`, theme.colors[variable]);
      }

      const increments = [100, 200, 300, 400, 500, 600, 700, 800, 900];
      increments.forEach((increment, index) => {
        const shade =
          index < 4
            ? tinycolor(theme.colors.primary)
                .lighten(index + 10)
                .toString()
            : tinycolor(theme.colors.primary)
                .darken(index + 10)
                .toString();
        themeElement.style.setProperty(`--color-primary-${increment}`, shade);
      });

      if (themeElement.classList.contains("default")) {
        const primaryColor = tinycolor(theme.colors.primary);
        themeElement.style.setProperty(
          "--color-primary-text",
          primaryColor.isLight()
            ? theme.colors.foreground
            : theme.colors.background,
        );

        if (primaryColor.getBrightness() > 165) {
          themeElement.style.setProperty("--primary", theme.colors.foreground);
          themeElement.style.setProperty(
            "--color-primary-text",
            primaryColor.isLight()
              ? theme.colors.background
              : theme.colors.foreground,
          );
        }
      }

      if (themeElement.classList.contains("inverted")) {
        const primaryColor = tinycolor(theme.colors.primary);
        themeElement.style.setProperty("--background", theme.colors.foreground);
        themeElement.style.setProperty("--foreground", theme.colors.background);
        themeElement.style.setProperty(
          "--color-primary-text",
          primaryColor.isLight()
            ? theme.colors.foreground
            : theme.colors.background,
        );

        if (primaryColor.isDark()) {
          themeElement.style.setProperty("--primary", theme.colors.background);
          themeElement.style.setProperty(
            "--color-primary-text",
            primaryColor.isLight()
              ? theme.colors.background
              : theme.colors.foreground,
          );
        }
      }

      if (themeElement.classList.contains("primary")) {
        const primaryColor = tinycolor(theme.colors.primary);
        themeElement.style.setProperty("--background", theme.colors.primary);
        themeElement.style.setProperty(
          "--foreground",
          primaryColor.isLight()
            ? theme.colors.foreground
            : theme.colors.background,
        );
        themeElement.style.setProperty(
          "--primary",
          primaryColor.isLight()
            ? theme.colors.foreground
            : theme.colors.background,
        );
        themeElement.style.setProperty(
          "--color-primary-text",
          primaryColor.isLight()
            ? theme.colors.background
            : theme.colors.foreground,
        );
      }

      if (themeElement.classList.contains("tinted")) {
        const tintedBackground = tinycolor(theme.colors.background)
          .darken(2)
          .toString();
        const primaryColor = tinycolor(theme.colors.primary);
        themeElement.style.setProperty("--background", tintedBackground);
        themeElement.style.setProperty(
          "--color-primary-text",
          primaryColor.isLight()
            ? theme.colors.foreground
            : theme.colors.background,
        );

        if (primaryColor.isLight()) {
          themeElement.style.setProperty("--primary", theme.colors.foreground);
          themeElement.style.setProperty(
            "--color-primary-text",
            primaryColor.isLight()
              ? theme.colors.background
              : theme.colors.foreground,
          );
        }
      }

      for (const fontVar in theme.fonts) {
        themeElement.style.setProperty(`--${fontVar}`, theme.fonts[fontVar]);
      }
    });
  };

  useEffect(() => {
    setTheme((prevTheme) => ({
      ...prevTheme,
      colors: {
        background: getCSSVariable("--background"),
        foreground: getCSSVariable("--foreground"),
        primary: getCSSVariable("--primary"),
        secondary: getCSSVariable("--secondary"),
      },
    }));
  }, []);

  useEffect(() => {
    const fetchTheme = async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("theme")
        .eq("subdomain", site ? site.subdomain : params.subdomain)
        .single();

      if (error) {
        console.error("Failed to fetch theme:", error);
      } else if (data) {
        setTheme(data.theme);
      }
    };

    fetchTheme();
  }, []);

  useEffect(() => {
    if (theme) {
      applyTheme(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const useThemeData = () => useContext(ThemeContext);
export { ThemeProvider, useThemeData };
