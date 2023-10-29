'use client'
import { useEffect} from 'react'
import { useThemeData } from '@/providers/theme-provider';

function AdBanner({ id, data }) {

  const { applyTheme, theme } = useThemeData();

  useEffect(() => {
    if (data?.theme?.value && theme) {
      applyTheme(theme);
    }
  }, [data?.theme?.value, theme]);




  return (

    <div key={id} className={`theme ${data?.theme?.value} bg-background text-foreground relative isolate px-3 md:px-5 py-10 md:py-20`}>
      <div className={`relative max-w-7xl z-20 w-full mx-auto h-full`}>
        <div className="w-full h-[125px] bg-black rounded flex items-center justify-center">
          <h3 className="text-gray-100">Banner Ad</h3>
       </div>
      </div>
    </div>
  );
}

export default AdBanner;
