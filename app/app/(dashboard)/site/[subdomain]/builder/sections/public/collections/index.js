'use client'
import { useEffect, useState } from "react";

import "@/styles/slick.css";
import "@/styles/slick-theme.css";

import Slider from "react-slick";
import { getAccount, getCollectionsClient } from "@/lib/fetchers/client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

function Collections({ id, data }) {
  const [collections, setCollections] = useState([])
  const params = useParams();

  var settings = {
    speed: 500,
    slidesToShow: 4,
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
          slidesToScroll: 1,
          centerMode: true,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  };


  useEffect(() => {
    const fetchCollections = async () => {
      const a = await getAccount(params.domain)
      const c = await getCollectionsClient(a?.id)
      const filtered = c?.filter(collection => data?.collections?.value?.includes(collection.name));
      setCollections(filtered);
    }

    fetchCollections();
  }, [data, params.domain])




  return (


    <div key={id} className={`theme ${data?.theme?.value} py-10 bg-background`}>
      <div className={`max-w-7xl w-full mx-auto h-full`}>
        <div className="px-3 md:px-0">
          <h2 className="mb-4 text-2xl font-bold font-primary">Collections</h2>
        </div>

        <div className="">
          <Slider {...settings}>
            {collections?.map((collection, id) => (
              <Link key={id} href={`/watch?v=${collection?.playlists[0]?.media_id}&collection=${collection.id}`} className="px-2 mx-2">
                <div className="relative w-full min-w-[250px] aspect-square h-full bg-primary shadow rounded overflow-hidden">
                  <Image
                    src={collection.poster}
                    alt={collection.name}
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute bottom-5 inset-x-0 flex justify-center items-center bg-background">
                    <span className="font-bold text-md text-foreground z-30">{collection.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </Slider>

        </div>
      </div>
    </div>
  );
}

export default Collections;
