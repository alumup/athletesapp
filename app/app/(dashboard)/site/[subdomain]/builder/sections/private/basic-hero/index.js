"use client";

function Banner({ id, data }) {
  return (
    <div
      key={id}
      className={`${
        data?.theme?.value === "dark" ? "dark" : ""
      } relative isolate bg-gray-50 px-3 py-10 md:px-5 md:py-20`}
    >
      <div className={`relative z-20 mx-auto h-full w-full max-w-7xl`}>
        <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-2">
          <div className="md:order-0 order-1 col-span-1 space-y-5">
            <div dangerouslySetInnerHTML={{ __html: data?.title?.value }} />
            <h2
              className={`text-muted mt-2 font-secondary text-xs font-light drop-shadow-lg md:text-lg md:text-sm ${
                data?.theme?.value === "dark"
                  ? "text-base-200 dark:text-base-100"
                  : "text-base-700 dark:text-base-500"
              } font-light`}
            >
              {data?.subtitle?.value}
            </h2>
            <div className="mt-8 flex items-center space-x-2">
              {data?.primaryCta && (
                <a
                  href={data?.primaryCta?.properties?.href.value}
                  className="btn-primary font-primary text-sm uppercase text-primary-foreground"
                >
                  {data?.primaryCta?.properties?.text.value}
                </a>
              )}
              {data?.secondaryCta && (
                <a
                  href={data?.secondaryCta?.properties?.href.value}
                  className="btn-outline-primary font-primary text-sm uppercase text-primary"
                >
                  {data?.secondaryCta?.properties?.text.value}
                </a>
              )}
            </div>
            <div className="mt-8">
              <h3 className="text-base">Or find me on:</h3>
              <div className="mt-4 flex space-x-4">
                <a
                  href="/"
                  className="cursor transform-gpu duration-300 ease-in-out hover:-translate-y-1"
                >
                  <img src="/spotify.svg" alt="Spotify" className="h-8 w-8" />
                </a>
                <a
                  href="/"
                  className="cursor transform-gpu duration-300 ease-in-out hover:-translate-y-1"
                >
                  <img
                    src="/apple-podcasts.svg"
                    alt="Apple Podcasts"
                    className="h-8 w-8"
                  />
                </a>
                <a
                  href="/"
                  className="cursor transform-gpu duration-300 ease-in-out hover:-translate-y-1"
                >
                  <img
                    src="/google-podcasts.svg"
                    alt="Google Podcasts"
                    className="h-8 w-8"
                  />
                </a>
                <a
                  href="/"
                  className="cursor transform-gpu duration-300 ease-in-out hover:-translate-y-1"
                >
                  <img
                    src="/soundcloud.svg"
                    alt="Soundcloud"
                    className="h-8 w-8"
                  />
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
