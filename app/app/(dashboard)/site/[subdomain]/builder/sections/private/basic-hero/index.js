'use client'


function Banner({ id, data }) {

  return (

    <div key={id} className={`${data?.theme?.value === 'dark' ? 'dark' : ''} relative isolate px-3 md:px-5 py-10 md:py-20 bg-gray-50`}>
      <div className={`relative max-w-7xl z-20 w-full mx-auto h-full`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div className="order-1 md:order-0 col-span-1 space-y-5">
            <div dangerouslySetInnerHTML={{ __html: data?.title?.value }} />
            <h2 className={`drop-shadow-lg text-xs md:text-sm font-light text-muted md:text-lg mt-2 font-secondary ${data?.theme?.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-500'} font-light`}>{data?.subtitle?.value}</h2>
            <div className="mt-8 flex items-center space-x-2">
              {data?.primaryCta && (
                <a href={data?.primaryCta?.properties?.href.value} className="btn-primary text-primary-foreground text-sm uppercase font-primary">{data?.primaryCta?.properties?.text.value}</a>
              )}
              {data?.secondaryCta && (
                <a href={data?.secondaryCta?.properties?.href.value} className="btn-outline-primary text-primary text-sm font-primary uppercase">{data?.secondaryCta?.properties?.text.value}</a>
              )}
            </div>
            <div className="mt-8">
              <h3 className="text-base">Or find me on:</h3>
              <div className="flex space-x-4 mt-4">
                <a href="/" className="hover:-translate-y-1 transform-gpu ease-in-out duration-300 cursor">
                  <img src="/spotify.svg" alt="Spotify" className="w-8 h-8" />
                </a>
                <a href="/" className="hover:-translate-y-1 transform-gpu ease-in-out duration-300 cursor">
                  <img src="/apple-podcasts.svg" alt="Apple Podcasts" className="w-8 h-8" />
                </a>
                <a href="/" className="hover:-translate-y-1 transform-gpu ease-in-out duration-300 cursor">
                  <img src="/google-podcasts.svg" alt="Google Podcasts" className="w-8 h-8" />
                </a>
                <a href="/" className="hover:-translate-y-1 transform-gpu ease-in-out duration-300 cursor">
                  <img src="/soundcloud.svg" alt="Soundcloud" className="w-8 h-8" />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Banner;
