import clsx from 'clsx'
import Image from 'next/image'
import image1 from '@/images/photos/1997-champs.png'
import image2 from '@/images/photos/chris-champs.webp'
import image3 from '@/images/photos/vance-champs.jpg'
import image4 from '@/images/photos/2008-champs.webp'
import image5 from '@/images/photos/aaron.jpg'

export default function Photos() {
  let rotations = ['rotate-2', '-rotate-2', 'rotate-2', 'rotate-2', '-rotate-2']

  return (
    <div className="pt-5 pb-10 md:pt-10 md:pb-20 bg-gray-50">
      <div className="-my-4 flex justify-center gap-5 overflow-hidden py-4 sm:gap-8">
        {[image1, image2, image3, image4, image5].map((image, imageIndex) => (
          <div
            key={image.src}
            className={clsx(
              'relative aspect-[9/10] w-44 flex-none overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:w-72 sm:rounded-2xl',
              rotations[imageIndex % rotations.length],
            )}
          >
            <Image
              src={image}
              alt=""
              sizes="(min-width: 640px) 18rem, 11rem"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}