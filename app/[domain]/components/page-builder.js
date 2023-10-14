'use client'
import { useEffect, useState } from 'react';
import { useSitePage } from '@/lib/hooks/use-site-page'
import { motion, AnimatePresence } from 'framer-motion';

// PUBLIC
import Banner from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/public/banner/index"
import Hero from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/public/hero/index"
import HtmlBlock from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/public/html-block/index"
import Products from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/public/products/index"
import Subscribe from '@/app/app/(dashboard)/site/[subdomain]/builder/sections/public/subscribe/index'

// PRIVATE
import HeroImage from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/private/hero-image/index"
import BasicHero from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/private/basic-hero/index"

export const PageBuilder = () => {
  const { page } = useSitePage();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (page?.data?.components) {
      setIsLoading(false);
    }
  }, [page?.data?.components]);


  return (
    <AnimatePresence mode="wait">
      {!isLoading && (
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0 }} // start from y: 50
          animate={{
            opacity: 1,
            transition: {
              duration: 0.25
            }
          }} // animate to y: 0
          exit={{ opacity: 0 }}
        >
          {page?.data?.components?.map((component) => {
            let Component;
            switch (component.name) {
              case "banner":
                Component = Banner;
                break;
              case "hero":
                Component = Hero;
                break;
              case "products":
                Component = Products;
                break;
              case "html-block":
                Component = HtmlBlock;
                break;
              case "hero-image":
                Component = HeroImage;
                break;
              case "basic-hero":
                Component = BasicHero;
                break;
              case "subscribe":
                Component = Subscribe;
                break;
              default:
                Component = function DefaultComponent() { return null; };
                break;
            }

            return (
              <Component key={component.id} id={component.id} data={component.properties} />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
