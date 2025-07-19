'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignedOut, SignInButton, SignUpButton, SignedIn } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

export const Navbar = () => {
  return (
    <nav
      className={cn(
        'p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent',
      )}
    >
      <div className='max-w-5xl mx-auto w-full flex justify-between items-center'>
        <Link href='/' className='flex items-center gap-2'>
          <Image src='/logo.svg' alt='Vibe' width={24} height={24} />

          <span className='font-semibold text-lg'>Nova</span>
        </Link>
        <SignedOut>
          <div className='flex gap-2'>
            <SignUpButton>
              <Button variant='outline'>Sign up</Button>
            </SignUpButton>
            <SignUpButton>
              <Button>Sign in</Button>
            </SignUpButton>
          </div>
        </SignedOut>
      </div>
    </nav>
  );
};
