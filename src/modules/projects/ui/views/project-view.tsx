'use client';

import { Suspense } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import MessagesContainer from '../components/messages-container';

interface Props {
  projectId: string;
}

// Client component to render a single project's data and its messages
const ProjectView = ({ projectId }: Props) => {
  return (
    <div className='h-screen'>
      <ResizablePanelGroup direction='horizontal'>
        {/* Render project and messages data for now (can be replaced with UI components) */}
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className='flex flex-col min-h-0'
        >
          <Suspense fallback={<div>Loading Messages...</div>}>
            <MessagesContainer projectId={projectId} />
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
