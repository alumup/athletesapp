'use client'
import { useEffect, useState } from 'react'
import { useThemeData } from '@/providers/theme-provider';
import { useShopify } from '@/components/shopify-provider';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Slider from "react-slick";



function SampleNextArrow(props) {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} !text-primary !z-30 rounded block text-center`}
      onClick={onClick}
    />
  );
}
function SamplePrevArrow(props) {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} !text-primary !z-30 rounded block text-center`}
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
          sortKey: 'CREATED_AT',
        });

        setProducts(products);
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    }

    getProducts();

  }, [data?.collection?.value, shopify]);


    var settings = {
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow  />,
    prevArrow: <SamplePrevArrow />,
      
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerMode: false,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
          centerMode: false,
           arrows: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
          centerMode: false,
          arrows: false
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  };


  return (

  <div key={id} className={`theme ${data?.theme?.value} bg-background text-foreground relative isolate px-3 md:px-5 py-10 md:py-20`}>
      <div className={`relative max-w-7xl z-20 w-full mx-auto h-full`}>
       
        <div className="grid grid-cols-3 md:grid-cols-6 gap-5 h-full md:divide-x divide-gray-200 ">
          <div className="col-span-3 w-full h-full pr-0 ">
            <h1 className="text-l font-primary font-medium text-foreground">Featured Video</h1>
            <div className="mt-3 relative aspect-video flex items-center justify-center bg-zinc-500 rounded overflow-hidden">
              <div className="object-cover object-center h-full w-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40" stroke="currentColor" className="h-10 w-10">
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth={1} fill="none"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 28L28 20L12 12v16zM28 20L12 12v16" />
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
          <div className="mt-5 md:mt-0 col-span-3 h-full w-full md:pl-5">
            <div>
              <h1 className="text-l font-medium font-primary text-foreground">Featured Products</h1>
            </div>
            <Slider {...settings}>
              {products && (
                products?.map((product) => {
                  return (
                    <motion.div
                        key={product.handle}
                        className="aspect-[9/16]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                    >
                      <div
                        className="mt-3 p-2 h-full w-full flex flex-col justify-between bg-white rounded"
                      >
                        <div className="relative aspect-[9/12] bg-zinc-300 rounded overflow-hidden rounded">
                          <Image
                            src={product.images[0].url}
                            fill
                            className="object-center object-cover"
                          />
                        </div>
                        <div className="mt-5 flex flex-col justify-between h-full">
                          <div>
                            <span className="text-[8px] text-gray-300">{product.vendor}</span>
                            <span clasName="text-gray-300 text-[8px]">$34.99</span>
                            <h3 className="text-xs text-gray-700">{product.title}</h3>
                          </div>
                          <div className="flex flex-col justify-center items-center">
                            <a href={`/products/${product.handle}`} className="bg-primary text-primary-foreground rounded px-2 py-1 text-sm w-full text-center">Shop Now</a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                }

                ))}
              
              </Slider>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Banner;
