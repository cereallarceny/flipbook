'use client';

import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NextLink from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';

const getLinkClasses = (isActive: boolean): string => {
  const defaultClasses =
    'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium';
  const activeClasses = 'border-indigo-500 text-gray-900';
  const inactiveClasses =
    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700';

  if (isActive) {
    return `${defaultClasses} ${activeClasses}`;
  }

  return `${defaultClasses} ${inactiveClasses}`;
};

const getDisclosureClasses = (isActive: boolean): string => {
  const defaultClasses =
    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium';
  const activeClasses = 'bg-indigo-50 border-indigo-500 text-indigo-700';
  const inactiveClasses =
    'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700';

  if (isActive) {
    return `${defaultClasses} ${activeClasses}`;
  }

  return `${defaultClasses} ${inactiveClasses}`;
};

const leftLinks = [
  { href: '/', label: 'Read' },
  { href: '/writer', label: 'Create' },
];

const rightLinks = [
  { href: 'https://github.com/cereallarceny/flipbook', label: 'GitHub' },
];

export default function Navbar(): JSX.Element | null {
  const pathname = usePathname();
  const search = useSearchParams();

  // If we have ?mode=standalone in the URL, don't render the navbar
  const mode = search.get('mode');
  if (mode === 'standalone') return null;

  return (
    <Disclosure
      as="nav"
      className="fixed top-0 left-0 z-20 w-full bg-white shadow"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon aria-hidden="true" className="block h-6 w-6" />
                  ) : (
                    <Bars3Icon aria-hidden="true" className="block h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <NextLink href="/">
                    <Image
                      alt="Flipbook"
                      height={32}
                      src="/logo.svg"
                      width={32}
                    />
                  </NextLink>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {leftLinks.map((link) => (
                    <NextLink
                      className={getLinkClasses(pathname === link.href)}
                      href={link.href}
                      key={link.href}
                    >
                      {link.label}
                    </NextLink>
                  ))}
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-stretch pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {rightLinks.map((link) => (
                  <NextLink
                    className={getLinkClasses(pathname === link.href)}
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </NextLink>
                ))}
              </div>
            </div>
          </div>
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-4 pt-2">
              {leftLinks.map((link) => (
                <Disclosure.Button
                  as={NextLink}
                  className={getDisclosureClasses(pathname === link.href)}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
