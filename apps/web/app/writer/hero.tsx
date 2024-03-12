import Image from 'next/image';

interface HeroProps {
  buttons: { id: string; children: JSX.Element }[];
  description: string;
  title: string;
  children: JSX.Element;
}

export default function Hero({
  buttons,
  description,
  title,
  children,
}: HeroProps): JSX.Element {
  return (
    <div className="bg-white pt-16 sm:pt-24 lg:pt-0">
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <Image
                  alt="Flipbook"
                  height={50}
                  src="/logotype.svg"
                  width={200}
                />
                <h1 className="mt-10 text-4xl font-bold text-gray-900 sm:text-6xl sm:leading-tight">
                  {title}
                </h1>
                <p className="mt-6 text-xl leading-8 text-gray-600">
                  {description}
                </p>
                <div className="mt-10 flex items-center gap-x-6 gap-y-6 flex-col sm:flex-row sm:gap-y-0">
                  {buttons.map((button) => (
                    <div key={button.id}>{button.children}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 md:-mr-20 lg:-mr-36"
            />
            <div className="shadow-lg md:rounded-3xl">
              <div className="bg-indigo-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
                <div
                  aria-hidden="true"
                  className="absolute -inset-y-px left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-indigo-100 opacity-20 ring-1 ring-inset ring-white md:ml-20 lg:ml-36"
                />
                <div className="relative px-6 pt-8 sm:pt-16 md:pl-16 md:pr-0">
                  <div className="mx-auto max-w-2xl md:mx-0 md:max-w-none">
                    {children}
                  </div>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 md:rounded-3xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
      </div>
    </div>
  );
}
