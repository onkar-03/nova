'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const ShimerMessages = () => {
  const messages = [
    'Thinking...',
    'Analyzing your request...',
    'Brewing a smart response...',
    'Generating magic...',
    'Crafting intelligent output...',
    'Connecting the dots...',
    'Synthesizing thoughts...',
    'Optimizing ideas...',
    'Refining your answer...',
    'Almost ready...',
  ];
  const [currentMessageIndex, setcurrentMessageIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setcurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className='flex  justify-start gap-2'>
      <span className='text-base text-muted-foreground animate-pulse'>
        <p className=' flex-2/3'>{messages[currentMessageIndex]}</p>
      </span>
    </div>
  );
};

export const MessageLoading = () => {
  return (
    <div className=' flex flex-col group px-2 pb-4'>
      <div className='flex items-center gap-2 pt-2 mb-2'>
        <Image
          src={'/logo.svg'}
          alt='nova'
          width={18}
          height={18}
          className='shrink-0S'
        />
        <span className='text-sm font-medium'> Nova</span>
      </div>
      <div className=' pt-3 flex flex-col gap-y-4'>
        <ShimerMessages />
      </div>
    </div>
  );
};
