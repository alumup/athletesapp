"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createContext, useState, useContext, useEffect } from "react";
import { useSearchParams, usePathname, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeData } from "@/providers/theme-provider";
import { getSiteData } from "@/lib/fetchers/client";

export const PageContext = createContext();

function PageProvider({ children }) {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const params = useParams();
  const pathname = usePathname();
  const { theme, applyTheme } = useThemeData();

  const [site, setSite] = useState(null);
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [pageState, setPageState] = useState({ components: [] });

  const [isLoading, setIsLoading] = useState(true);

  const updatePage = async () => {
    const { data, error } = await supabase.from("pages").upsert(
      [
        {
          site_id: site?.id,
          name: activePage.name,
          slug: activePage.slug,
          data: pageState,
        },
      ],
      { onConflict: ["site_id", "slug"] },
    );

    if (error) {
      console.log("updatePage - PageProvider", error);
    }
  };

  useEffect(() => {
    const findSite = async () => {
      const website = await getSiteData(params.subdomain);
      console.log("WEBSITE", website);
      setSite(website);
      const { data: pagesData } = await supabase
        .from("pages")
        .select("*")
        .eq("site_id", website?.id);
      setPages(pagesData);

      const search = searchParams.get("page");
      const { data: activePageData } = await supabase
        .from("pages")
        .select("*")
        .eq("site_id", website?.id)
        .eq(
          "slug",
          pathname == "/" ? "home" : params.slug ? params.slug : search,
        )
        .single();

      setActivePage(activePageData);
      setPageState(activePageData?.data);
      setIsLoading(false);
    };

    findSite();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      applyTheme(theme);
    }
  }, [pageState, isLoading]);

  useEffect(() => {
    if (
      site &&
      pageState?.components?.length > 0 &&
      typeof window !== "undefined" &&
      activePage
    ) {
      updatePage();
    }
  }, [pageState]);

  return (
    <PageContext.Provider
      value={{
        site,
        pages,
        pageState,
        setPageState,
        activePage,
        setActivePage,
      }}
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key={"loader"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "ease", stiffness: 100, delay: 0.25 }}
            exit={{ opacity: 0 }}
            className="flex h-screen w-full flex-col items-center justify-center bg-gray-50"
          >
            <h1>Loading...</h1>
          </motion.div>
        )}
        {!isLoading && (
          <motion.div
            key={"components"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "ease",
              stiffness: 100,
              delay: 0.1,
              duration: 0.5,
            }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </PageContext.Provider>
  );
}

const usePageData = () => useContext(PageContext);

export { PageProvider, usePageData };
