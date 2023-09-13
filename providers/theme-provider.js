'use client'

import React, { useState, useEffect, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Raleway, Playfair_Display, Inter } from 'next/font/google';
const raleway = Raleway({subsets: ['latin'] });
const playfair = Playfair_Display({style: ['italic'], subsets: ['latin']})
const inter = Inter({subsets: ['latin']}) 
import { useParams } from 'next/navigation';

export const ThemeContext = React.createContext();

function ThemeProvider({ site, children }) {
  const params = useParams();
  const supabase = createClientComponentClient();

  const [theme, setTheme] = useState({
    colors: {
  
      'background': 'var(--background)',
      'foreground': 'var(--foreground)',
      'card': 'var(--card)',
      'card-foreground': 'var(--card-foreground)',
      'primary': 'var(--primary)',
      'primary-foreground': 'var(--primary-foreground)',
      'secondary': 'var(--secondary)',
      'secondary-foreground': 'var(--secondary-foreground)',
      'muted': 'var(--muted)',
      'muted-foreground': 'var(--muted-foreground)',

    },
    'dark-colors': {
      'background': 'var(--background)',
      'foreground': 'var(--foreground)',
      'primary': 'var(--primary)',
      'primary-foreground': 'var(--primary-foreground)',
      'secondary': 'var(--secondary)',
      'secondary-foreground': 'var(--secondary-foreground)',
      'muted': 'var(--muted)',
      'muted-foreground': 'var(--muted-foreground)',
    },
    fonts: {
      "font-primary": raleway.style.fontFamily,
      "font-secondary": playfair.style.fontFamily,
      "font-tertiary": inter.style.fontFamily,
    },

  });

  const applyTheme = (theme) => {
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
  };

  useEffect(() => {
    const fetchTheme = async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('theme')
        .eq('subdomain', site ? site.subdomain : params.subdomain)
        .single();

      if (error) {
        console.error('Failed to fetch theme:', error);
      } else if (data && data.theme) {
        setTheme(data.theme);
        applyTheme(data.theme)
      }
    };

    fetchTheme();
  }, []);




  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const useThemeData = () => useContext(ThemeContext);
export { ThemeProvider, useThemeData };