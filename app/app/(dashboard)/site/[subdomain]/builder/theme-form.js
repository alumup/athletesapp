"use client";

import {
  fontMapper,
  inter,
  cal,
  fira,
  raleway,
  playfair,
  lora,
  bricolageGrotesque,
} from "@/styles/fonts";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams } from "next/navigation";
import { useThemeData } from "@/providers/theme-provider";

function ThemeForm() {
  const supabase = createClientComponentClient();
  const params = useParams();
  const { theme, setTheme, applyTheme } = useThemeData();

  const handleChange = async (event) => {
    const { name, value } = event.target;
    const [category, variable] = name.split(".");

    // Update the theme state
    setTheme((prevTheme) => ({
      ...prevTheme,
      [category]: {
        ...prevTheme[category],
        [variable]: value,
      },
    }));

    // Apply the theme
    applyTheme(theme);

    // Save the theme to the database
    try {
      const { data, error } = await supabase
        .from("sites")
        .update({
          theme: {
            ...theme,
            [category]: {
              ...theme[category],
              [variable]: value,
            },
          },
        })
        .eq("subdomain", params.subdomain)
        .single(); // replace 'siteId' with the actual ID of the site

      if (data) {
        setTheme(data.theme);
      }

      if (error) {
        throw error;
      }

      // You can do something after the theme is successfully saved here
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };
  return (
    <form className="relative h-full overflow-y-auto">
      {Object.entries(theme).map(([category, values]) => (
        <div key={category} className="space-y-2">
          <h2 className="titlecase my-2 text-sm font-bold">{category}</h2>
          {Object.entries(values).map(([variable, value]) => {
            switch (category) {
              case "colors":
              case "dark-colors":
                return (
                  <div
                    className="flex w-full items-center justify-between rounded border border-gray-300 p-1"
                    key={variable}
                  >
                    <label
                      htmlFor={variable}
                      className="mb-2 text-xs text-gray-700"
                    >
                      {variable}
                    </label>
                    <input
                      type="color"
                      id={variable}
                      name={`${category}.${variable}`}
                      value={value}
                      onChange={handleChange}
                      className="h-6 w-6 bg-white"
                    />
                  </div>
                );
              case "fonts":
                return (
                  <div className="flex w-full flex-col rounded" key={variable}>
                    <label
                      htmlFor={variable}
                      className="mb-2 text-xs text-gray-700"
                    >
                      {variable}
                    </label>
                    <select
                      id={variable}
                      name={`${category}.${variable}`}
                      value={value}
                      onChange={handleChange}
                      className="mt-2 flex w-full justify-between rounded border border-gray-200 bg-white text-sm"
                    >
                      {/* Replace ['Roboto', 'Open Sans'] with your list of fonts */}
                      {[
                        bricolageGrotesque,
                        cal,
                        raleway,
                        playfair,
                        inter,
                        fira,
                        lora,
                      ].map((font, i) => (
                        <option
                          key={i}
                          value={font.style.fontFamily}
                          className={`${font.className}`}
                        >
                          {fontMapper[font.className]}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>
      ))}
    </form>
  );
}

export default ThemeForm;
