'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PROJECT_TEMPLATES } from '@/app/(home)/constants';
import { useClerk } from '@clerk/nextjs';

const formSchema = z.object({
  value: z.string().min(1, { message: 'Value is required' }),
  // .max(1000, { message: "Value is too  long" }),
});

const ProjectForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const clerk = useClerk();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  });

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
        router.push(`/projects/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message);

        if (error?.data?.code === 'UNAUTHORIZED') {
          clerk.openSignIn();
        }
        // TODO: Redirect to pricing page if specific error
      },
    }),
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createProject.mutateAsync({
      value: values.value,
    });
  };

  const onSelect = (value: string) => {
    form.setValue('value', value, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const isPending = createProject.isPending;
  const isButtonDisbled = isPending || !form.formState.isValid;
  const [isFocuesd, setIsFocused] = useState(false);

  return (
    <Form {...form}>
      <section className='space-y-4'>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            'relative border p-4 pt-1 rounded-xl bg-sidebar transition-all',
            isFocuesd && 'shadow-xs',
          )}
        >
          <FormField
            control={form.control}
            name='value'
            render={({ field }) => (
              <TextareaAutosize
                {...field}
                disabled={isPending}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                minRows={2}
                maxRows={8}
                className='pt-4 resize-none border-none w-full outline-none bg-transparent'
                placeholder='what would you like to build?'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                  }
                }}
              />
            )}
          />

          <div className='flex gap-x-2 items-end justify-between pt-2'>
            <div className='text-[10px] text-muted-foreground font-mono'>
              <kbd
                className='ml-auto pointer-events-auto inline-flex h-5 select-none items-center
       gap-1 rounded border bg-muted  px-1.5 font-mono text=[10px] font-medium '
              >
                <span>&#8984;</span>Enter
              </kbd>
              &nbsp;to Submit
            </div>

            <Button
              disabled={isButtonDisbled}
              className={cn(
                'size-8 rounded-full',
                isButtonDisbled && 'bg-muted-foreground border',
              )}
            >
              {isPending ? (
                <Loader2Icon className='size-4 animate-spin' />
              ) : (
                <ArrowUpIcon />
              )}
            </Button>
          </div>
        </form>
        <div className='flex-wrap justify-center gap-2 hidden md:flex max-w-3xl'>
          {PROJECT_TEMPLATES.map((template) => (
            <Button
              key={template.title}
              variant='outline'
              size='sm'
              className='bg-white dark:bg-sidebar'
              onClick={() => onSelect(template.prompt)}
            >
              {template.emoji} {template.title}
            </Button>
          ))}
        </div>
      </section>
    </Form>
  );
};

export default ProjectForm;
