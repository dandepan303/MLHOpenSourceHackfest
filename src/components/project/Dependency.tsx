import { Dependency } from "@/lib/generated/prisma/prisma";
import { RelationDependency } from "@/types/types";
import { DependencyChangeData } from "./Project";

interface DependencyComponentProps {
  dependency: RelationDependency;
  saveChanges: (changes: DependencyChangeData[]) => void;
}

export default function DependencyComponent({ dependency, saveChanges }: DependencyComponentProps) {
  const handleDelete = () => {
    // Save one change - wrap in array bc thats how the function is
    saveChanges([{
      changeType: 'delete',
      id: dependency.id,
      name: dependency.name,
      licenseType: dependency.licenseType,
    }]);
  };

  return (
    <div 
      className="w-full rounded-lg px-4 py-3 flex items-center justify-between mb-1.5"
      style={{ backgroundColor: '#CB9451' }}
    >
      <div className="flex-1 text-gray-800 font-medium">
        {dependency.name}
      </div>
      <div className="flex-1 text-gray-800 font-medium text-right">
        {dependency.licenseType || 'Unknown'}
      </div>
      <button
        onClick={handleDelete}
        className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 transition-colors ml-4 flex items-center justify-center text-white font-bold"
        aria-label="Delete dependency"
      >
        ×
      </button>
    </div>
  );
}