import Image from 'next/image';
import logo from '../../public/logo.svg';

interface HeroProps {
  buttons: {
    href: string;
    children: string | JSX.Element;
  }[];
  description: string;
  fileName: string;
  title: string;
  children: JSX.Element;
}

export default function Hero({
  buttons,
  description,
  fileName,
  title,
  children,
}: HeroProps): JSX.Element {
  return (
    <div className="bg-white">
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <Image alt="Your Company" className="h-11" {...logo} />
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  {title}
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  {description}
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  {buttons.length > 0 && (
                    <a
                      className="rounded-md bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-600 focus:outline-none"
                      href={buttons[0]?.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {buttons[0]?.children}
                    </a>
                  )}
                  {buttons.length > 1 && (
                    <a
                      className="font-semibold text-gray-700 hover:text-gray-900"
                      href={buttons[1]?.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {buttons[1]?.children}
                    </a>
                  )}
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
                    <div className="overflow-hidden rounded-tl-xl bg-gray-900">
                      <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                        <div className="-mb-px flex text-sm font-medium leading-6 text-gray-400">
                          <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
                            {fileName}
                          </div>
                        </div>
                      </div>
                      <div className="px-6 pb-14 pt-6">{children}</div>
                    </div>
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
