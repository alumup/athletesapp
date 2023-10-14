'use client'
import Slider from "react-slick";
import clsx from 'clsx'
import { useEffect, useState } from "react";
import { getCollectionByNameClient } from "@/lib/fetchers/client";
import { useThemeData } from '@/providers/theme-provider';
import { motion } from 'framer-motion';
import { placeholderBlurhash } from "@/lib/utils";
import Image from "next/image";
import { useParams } from "next/navigation";

function Collection({ id, data }) {
  const [collection, setCollection] = useState(null)
  const params = useParams();
  const blurUrl = placeholderBlurhash;

  var settings = {
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          centerMode: false,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          centerMode: true,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          centerMode: true,
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  };


  const { applyTheme, theme } = useThemeData();

  // Reapply theme whenever data.theme.value changes
  useEffect(() => {
    if (data?.theme?.value && theme) {
      applyTheme(theme);
    }
  }, [data?.theme?.value]);




  useEffect(() => {
    getCollectionByNameClient(data?.collection?.value, params.domain).then((result) => {
      setCollection(result);
    });

  }, [data, params.domain])





  let rotations = ['rotate-2', '-rotate-2', 'rotate-2', 'rotate-2', '-rotate-2']

  return (
    <div key={id}>
      <div className={`theme ${data?.theme?.value} bg-background text-foreground relative isolate py-10 md:py-20 min-h-[352px] md:min-h-[432px] h-auto transition-height duration-1000 ease-in`}>
        {/* <h3 className="text-2xl md:text-3xl font-bold font-primary text-foreground">{data?.title?.value}</h3>
          <h4 className="text-md md:text-base text-center font-light text-muted-foreground">{componentData?.subtitle?.value}</h4> */}
        <Slider {...settings}>
          {collection?.playlists?.map((media, i) => {
            return (
              <motion.div
                key={i}
                className="w-full mx-2 px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                <div
                  className={clsx(
                    'relative aspect-square min-w-[250px] h-full flex-none overflow-hidden shadow rounded-2xl',
                    rotations[i % rotations.length],
                  )}>
                  <Image
                    src={media.media.url}
                    placeholder="blur"
                    blurDataURL={blurUrl}
                    alt={media.media.name}
                    fill
                    className="object-cover object-center"
                  />
                </div>
              </motion.div>
            )
          })}
        </Slider>

      </div>
    </div>

  );
}

export default Collection;
