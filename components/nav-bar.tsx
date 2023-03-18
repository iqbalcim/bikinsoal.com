"use client"
import { cn } from '@/lib/utils'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { BurgerMenu } from './burgermenu'
import ButtonSession from './button-session'
import { Button } from './ui/button'

const Navbar = ({ session }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <div className={cn("fixed inset-x-0 top-0 z-10 flex justify-between bg-white p-4 transition lg:px-12", isScrolled ? 'shadow-sm' : '')}>
      <Link href="/" className='inline-flex'>
        <Image alt='logo' src={"/logo.png"} width={175} height={100} className="w-24 object-contain lg:w-32 xl:w-40" />
      </Link>

      <div className='hidden items-center gap-4 md:inline-flex'>
        <Link href="/app/generate" className='rounded-lg px-3 py-2 text-sm font-bold hover:bg-zinc-100'>Generate Soal</Link>
        <Link href="/app/banksoal" className='rounded-lg px-3 py-2 text-sm font-bold hover:bg-zinc-100'>Bank Soal</Link>
        <Link href="/app/myaccount" className='rounded-lg px-3 py-2 text-sm font-bold hover:bg-zinc-100'>Akun Saya</Link>
        <ButtonSession session={session} />
      </div>
      <div className='flex md:hidden'>
        <BurgerMenu />
      </div>
    </div>
  )
}

export default Navbar