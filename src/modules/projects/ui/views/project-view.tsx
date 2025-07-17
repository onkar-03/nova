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

interface Props {
  projectId: string;
}

// Client component to render a single project's data and its messages
const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setactiveFragment] = useState<Fragment | null>(null);
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
          TODO: Preview
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ProjectView;
