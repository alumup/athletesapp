"use client";
import { useEffect, useState } from "react";
import { useThemeData } from "@/providers/theme-provider";
import { useShopify } from "@/components/shopify-provider";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Slider from "react-slick";

function SampleNextArrow(props) {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} !z-30 block rounded text-center !text-primary`}
      onClick={onClick}
    />
  );
}
function SamplePrevArrow(props) {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} !z-30 block rounded text-center !text-primary`}
      onClick={onClick}
    />
  );
}

function Banner({ id, data }) {
  const { applyTheme, theme } = useThemeData();
  const shopify = useShopify();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (data?.theme?.value && theme) {
      applyTheme(theme);
    }
  }, [data?.theme?.value, theme]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const products = await shopify?.getCollectionProducts({
          collection: data?.featuredProducts?.value,
          reverse: true,
          sortKey: "CREATED_AT",
        });

        setProducts(products);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };

    getProducts();
  }, [data?.collection?.value, shopify]);

  var settings = {
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerMode: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
          centerMode: false,
          arrows: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
          centerMode: false,
          arrows: false,
        },
      },
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ],
  };

  return (
    <div
      key={id}
      className={`theme ${data?.theme?.value} relative isolate bg-background px-3 py-10 text-foreground md:px-5 md:py-20`}
    >
      <div className={`relative z-20 mx-auto h-full w-full max-w-7xl`}>
        <div className="grid h-full grid-cols-3 gap-5 divide-gray-200 md:grid-cols-6 md:divide-x ">
          <div className="col-span-3 h-full w-full pr-0 ">
            <h1 className="text-l font-primary font-medium text-foreground">
              Featured Video
            </h1>
            <div className="relative mt-3 flex aspect-video items-center justify-center overflow-hidden rounded bg-zinc-500">
              <div className="h-full w-full object-cover object-center"></div>
              <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 transform text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 40 40"
                  stroke="currentColor"
                  className="h-10 w-10"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="currentColor"
                    strokeWidth={1}
                    fill="none"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 28L28 20L12 12v16zM28 20L12 12v16"
                  />
                </svg>
              </div>
              {/* <VideoPlayer
                className="relative z-10 h-full max-h-full shadow-xl w-full rounded overflow-hidden"
                video={video}
                adsEnabled={false}
                data={{
                  video_title: video?.name,
                  video_id: video?.id,
                  video_stream_type: "on-demand",
                }}
              /> */}
            </div>
          </div>
          <div className="col-span-3 mt-5 h-full w-full md:mt-0 md:pl-5">
            <div>
              <h1 className="text-l font-primary font-medium text-foreground">
                Featured Products
              </h1>
            </div>
            <Slider {...settings}>
              {products &&
                products?.map((product) => {
                  return (
                    <motion.div
                      key={product.handle}
                      className="aspect-[9/16]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25, duration: 0.5 }}
                    >
                      <div className="mt-3 flex h-full w-full flex-col justify-between rounded bg-white p-2">
                        <div className="relative aspect-[9/12] overflow-hidden rounded rounded bg-zinc-300">
                          <Image
                            src={product.images[0].url}
                            fill
                            className="object-cover object-center"
                          />
                        </div>
                        <div className="mt-5 flex h-full flex-col justify-between">
                          <div>
                            <span className="text-[8px] text-gray-300">
                              {product.vendor}
                            </span>
                            <span clasName="text-gray-300 text-[8px]">
                              $34.99
                            </span>
                            <h3 className="text-xs text-gray-700">
                              {product.title}
                            </h3>
                          </div>
                          <div className="flex flex-col items-center justify-center">
                            <a
                              href={`/products/${product.handle}`}
                              className="w-full rounded bg-primary px-2 py-1 text-center text-sm text-primary-foreground"
                            >
                              Shop Now
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
