'use client';

import { Suspense, useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import MessagesContainer from '../components/messages-container';
import { Fragment } from '@/generated/prisma';
import ProjectHeader from '../components/project-header';
import FragmentWeb from '../components/fragment-web';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { EyeIcon, CodeIcon, CrownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  projectId: string;
}

// Client component to render a single project's data and its messages
const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setactiveFragment] = useState<Fragment | null>(null);

  const [tabState, setTabState] = useState<'preview' | 'code'>('preview');

  return (
    <div className='h-screen'>
      <ResizablePanelGroup direction='horizontal'>
        {/* Render project and messages data for now (can be replaced with UI components) */}
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className='flex flex-col min-h-0'
        >
          <Suspense fallback={<div>Loading Project Project...</div>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<div>Loading Messages...</div>}>
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setactiveFragment}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={50}>
          <Tabs
            className='h-full gap-y-0'
            defaultValue='preview'
            value={tabState}
            onValueChange={(value) => setTabState(value as 'preview' | 'code')}
          >
            <div className='w-full flex items-center p-2 border-b gap-x-2'>
              <TabsList className='h-8 p-0 border rounded-md'>
                <TabsTrigger value='preview' className='rounded-md'>
                  <EyeIcon />
                  <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value='code' className='rounded-md'>
                  <CodeIcon />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className='ml-auto flex items-center gap-x-2'>
                <Button asChild size='sm' variant='default'>
                  <Link href='/pricing'>
                    <CrownIcon />
                    Upgrade
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value='preview'>
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>
            <TabsContent value='code'>
              <p>TODO: Code</p>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ProjectView;
