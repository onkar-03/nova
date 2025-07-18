import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import MessageCard from './message-card';
import MessageForm from './message-form';
import { useEffect, useRef } from 'react';
import { Fragment } from '@/generated/prisma';
import { MessageLoading } from './message-loading';

interface Props {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
}

const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: Props) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const lastAssistanceMessageIdRef = useRef<string | null>(null);

  const trpc = useTRPC();

  // Fetch all messages related to the given projectId
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions(
      { projectId },
      {
        // TODO: Temp Live message Update
        refetchInterval: 5000,
      },
    ),
  );

  useEffect(() => {
    const lastAssistanceMessage = messages.findLast(
      (message) => message.role === 'ASSISTANCE' && !!message.fragment,
    );

    if (
      lastAssistanceMessage?.fragment &&
      lastAssistanceMessage.id !== lastAssistanceMessageIdRef.current
    ) {
      setActiveFragment(lastAssistanceMessage.fragment);
      lastAssistanceMessageIdRef.current = lastAssistanceMessage.id;
    }
  }, [messages, setActiveFragment]);

  useEffect(() => {
    buttonRef.current?.scrollIntoView();
  }, [messages.length]);

  const lastMessage = messages[messages.length - 1];
  const isLastMessagUser = lastMessage?.role === 'USER';

  return (
    <div className='flex flex-col flex-1 min-h-0'>
      <div className='flex-1 min-h-0 overflow-y-auto'>
        <div className='pt-2 pr-1'>
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              fragment={message.fragment}
              createdAt={message.createdAt}
              isActiveFragment={activeFragment?.id === message.fragment?.id}
              onFragmentClick={() => {
                setActiveFragment(message.fragment);
              }}
              type={message.type}
            />
          ))}
          {isLastMessagUser && <MessageLoading />}
          <div ref={buttonRef} />
        </div>
      </div>
      <div className='relative p-3 pt-1'>
        <div className='absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none' />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};

export default MessagesContainer;
