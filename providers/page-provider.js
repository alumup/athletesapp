'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createContext, useState, useContext, useEffect } from 'react';
import { useSearchParams, usePathname, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion';
import { getSiteData } from '@/lib/fetchers/client';
export const PageContext = createContext();


function PageProvider({ children }) {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams()
  const params = useParams()
  const pathname = usePathname()
  const [pageState, setPageState] = useState({ components: [] });
  const [activePage, setActivePage] = useState(null)
  const [pages, setPages] = useState([])
  const [liveMode, setLiveMode] = useState(false)
  const [site, setSite] = useState(null)

  useEffect(() => {
    const findSite = async () => {
      const website = await getSiteData(params.subdomain)
      console.log("WEBSITTE", website)
      setSite(website)
    }

    findSite();

    setLiveMode(searchParams.get('page') ? false : true)
    
  },[])

  useEffect(() => {
    const getPages = async () => {
      const {data} = await supabase
          .from('pages')
          .select('*')
          .eq('site_id', site?.id)
      
      setPages(data)
    }

    getPages();

  },[site])

  const updatePage = async () => {
    const {data, error} = await supabase
      .from('pages')
      .upsert([
        { site_id: site?.id, name: activePage.name, slug: activePage.slug, data: pageState },
      ], { onConflict: ['site_id', 'slug'] })
   
      if (error) {
        console.log("ERROR", error)
      }

      if (data) {
        console.log("DATA", data)
      }
  }


  useEffect(() => {
    console.log("PATHNAME IN PROVIDER", pathname)

    const search = searchParams.get('page')
    console.log("PAGE PARAM IN PROVIDER", search)


    const getActivePage = async () => {
      const {data, error} = await supabase
        .from('pages')
        .select('*')
        .eq('slug', pathname == '/' ? 'home' : params.slug ? params.slug : search)
        .single()
      
      if (error) {
        console.log("ERROR", error)
      }

      if (data) {
        setActivePage(data)
        setPageState(data.data)
      }
    }

    getActivePage();


 
  }, [pathname, searchParams]);
  
  
  useEffect(() => {
  
    if (site && pageState?.components?.length > 0 && typeof window !== "undefined" && activePage) {
      updatePage()
    }
  
  }, [pageState]);


  if (!liveMode) {
    return (
      <PageContext.Provider value={{site, pages, liveMode, setLiveMode, pageState, setPageState, activePage, setActivePage}}>
        {children}
      </PageContext.Provider>
    )
  }

  return(
    <PageContext.Provider value={{site, pages, liveMode, setLiveMode, pageState, setPageState, activePage, setActivePage}}>
      <AnimatePresence mode="wait">
        {pageState.components.length === 0 && (
          <motion.div 
            key={'loader'}
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            transition={{ type: "ease", stiffness: 100, delay: 0.25}}
            exit={{ opacity: 0 }}
            className="h-screen w-full flex flex-col items-center justify-center bg-gray-50"
          >
            <h1>Loading...</h1>
          </motion.div>
        )}
        {pageState.components.length > 0 && (
            <motion.div 
            key={'components'}
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            transition={{ type: "ease", stiffness: 100, delay: 0.1, duration: 0.5}}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        )}
        
      </AnimatePresence>
    </PageContext.Provider>
  ) 

}

const usePageData = () => useContext(PageContext);

export { PageProvider, usePageData };