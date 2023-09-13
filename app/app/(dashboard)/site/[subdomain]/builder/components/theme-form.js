'use client'
import { useEffect, useContext } from 'react';
import { Raleway, Playfair_Display, Inter } from 'next/font/google';
const raleway = Raleway({subsets: ['latin'] });
const playfair = Playfair_Display({style: ['italic'], subsets: ['latin']})
const inter = Inter({subsets: ['latin']}) 
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams } from 'next/navigation';
import { useThemeData } from '@/providers/theme-provider';

function ThemeForm() {
  
  const supabase = createClientComponentClient();
  const params = useParams()
  const { theme, setTheme, applyTheme } = useThemeData();



  const handleChange = (event) => {
    const { name, value } = event.target;
    const [category, variable] = name.split('.');
    setTheme(prevTheme => ({
      ...prevTheme,
      [category]: {
        ...prevTheme[category],
        [variable]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    applyTheme(theme);
    for (const category in theme) {
      for (const variable in theme[category]) {
        if (category === 'dark-colors') {
          // Check if the .dark element exists
          const darkElement = document.querySelector('.dark');
          if (darkElement) {
            // Set the variable on the .dark class
            darkElement.style.setProperty(`--${variable}`, theme[category][variable]);
          }
        } else {
          // Set the variable on the root
          document.documentElement.style.setProperty(`--${variable}`, theme[category][variable]);
        }
      }
    }

    try {

      const { data, error } = await supabase
        .from('sites')
        .update({ theme: theme })
        .eq('subdomain', params.subdomain)
        .single(); // replace 'siteId' with the actual ID of the site
  
      if (data) {
       console.log("SITE", data)
       setTheme(data.theme)
      }

      if (error) {
        throw error;
      }
  
      // You can do something after the theme is successfully saved here
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative h-full overflow-y-auto">
    {Object.entries(theme).map(([category, values]) => (
      <div key={category} className="space-y-2">
        <h2 className="text-sm font-bold my-2 titlecase">{category}</h2>
        {Object.entries(values).map(([variable, value]) => {
          switch (category) {
            case 'colors':
            case 'dark-colors':
              return (
                <div className="w-full border border-gray-300 p-1 rounded flex items-center justify-between" key={variable}>
                  <label htmlFor={variable} className="text-xs mb-2 text-gray-700">{variable}</label>
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
            case 'fonts':
              return (
                <div className="w-full flex flex-col rounded" key={variable}>
                  <label htmlFor={variable} className="text-xs mb-2 text-gray-700">{variable}</label>
                  <select
                    id={variable}
                    name={`${category}.${variable}`}
                    value={value}
                    onChange={handleChange}
                    className="bg-white border border-gray-200 rounded flex justify-between text-sm w-full mt-2"
                  >
                    {/* Replace ['Roboto', 'Open Sans'] with your list of fonts */}
                    {[raleway, playfair, inter].map((font,i) => (
                      <option key={i} value={font.style.fontFamily}>{font.style.fontFamily}</option>
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
      <div className="my-5">
        <button type="submit" className="w-full bg-indigo-500 text-sm text-white p-2 rounded">Update Theme</button>
      </div>
      
    </form>
  );
}

export default ThemeForm;