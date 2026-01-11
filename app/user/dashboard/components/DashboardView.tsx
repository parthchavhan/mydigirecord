'use client';

import { useState, useMemo } from 'react';
import DocumentCategoryChart from './DocumentCategoryChart';
import { Tree, Folder, File } from '@/components/ui/file-tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface DashboardViewProps {
  files: any[];
  folders: any[];
}

const CATEGORIES = [
  'Personal',
  'Educational',
  'Financial',
  'Legal',
  'Medical',
  'Shared With me',
  'Professional',
  'Certificate',
];

export default function DashboardView({ files, folders }: DashboardViewProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  // Helper to get all files within a folder (recursively)
  const getFilesUnderFolder = (folderId: string, allFiles: any[], allFolders: any[]): any[] => {
    let result = allFiles.filter(f => f.folderId === folderId);
    
    const subFolders = allFolders.filter(f => f.parentId === folderId);
    subFolders.forEach(sf => {
      result = [...result, ...getFilesUnderFolder(sf.id, allFiles, allFolders)];
    });
    
    return result;
  };

  // Filter files based on selection
  const filteredFiles = useMemo(() => {
    if (!selectedId) return files;

    // Check if selectedId is a file
    const selectedFile = files.find(f => f.id === selectedId);
    if (selectedFile) return [selectedFile];

    // Check if selectedId is a folder
    const selectedFolder = folders.find(f => f.id === selectedId);
    if (selectedFolder) {
      return getFilesUnderFolder(selectedId, files, folders);
    }

    return files;
  }, [selectedId, files, folders]);

  // Count files by category for the filtered set
  const categoryCounts = CATEGORIES.map((category) => {
    const count = filteredFiles.filter((file) => file.category === category).length;
    return {
      name: category,
      count,
      color: getCategoryColor(category),
    };
  }).filter((item) => item.count > 0);

  // Recursive function to render the tree
  const renderTree = (parentId: string | null = null) => {
    const currentFolders = folders.filter(f => f.parentId === parentId);
    const currentFiles = files.filter(f => f.folderId === parentId);

    return (
      <>
        {currentFolders.map(folder => (
          <Folder key={folder.id} element={folder.name} value={folder.id}>
            {renderTree(folder.id)}
          </Folder>
        ))}
        {currentFiles.map(file => (
          <File key={file.id} value={file.id}>
            {file.name}
          </File>
        ))}
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* File Tree Section */}
      <Card className="lg:col-span-1 overflow-hidden flex flex-col h-[500px]">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            File Explorer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <Tree
            className="p-4"
            initialSelectedId={selectedId}
            onSelectChange={(id) => setSelectedId(id as string)}
          >
            {renderTree(null)}
          </Tree>
        </CardContent>
        {selectedId && (
          <div className="p-3 border-t bg-gray-50/30">
            <button 
              onClick={() => setSelectedId(undefined)}
              className="text-xs text-[#9f1d35] hover:underline font-medium"
            >
              Clear Selection
            </button>
          </div>
        )}
      </Card>

      {/* Chart Section */}
      <div className="lg:col-span-2">
        <DocumentCategoryChart data={categoryCounts} />
      </div>
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'Personal': '#3b82f6',        // blue
    'Educational': '#f97316',     // orange
    'Financial': '#6b7280',       // gray
    'Legal': '#eab308',            // yellow
    'Medical': '#06b6d4',         // light blue
    'Shared With me': '#10b981',  // green
    'Professional': '#1e40af',     // dark blue
    'Certificate': '#8b5cf6',     // purple
  };
  return colorMap[category] || '#6b7280';
}
