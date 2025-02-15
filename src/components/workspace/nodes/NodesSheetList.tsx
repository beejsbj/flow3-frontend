import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import { nodeRegistry, type CategoryData } from "@/services/registry";
import { useAddNode } from "@/stores/workspace";
import { getIconByName } from "@/utils/icons";

interface NodesSheetListProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onNodeSelect?: (nodeType: string) => void;
  showTrigger?: boolean;
}

export function NodesSheetList({
  open,
  onOpenChange,
  onNodeSelect,
  showTrigger = true,
}: NodesSheetListProps) {
  const [selectedCategory, setSelectedCategory] =
    React.useState<CategoryData | null>(null);
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const categories = nodeRegistry.getCategoriesWithNodes();
  const addNode = useAddNode();

  const handleAddNode = (nodeType: string) => {
    if (onNodeSelect) {
      onNodeSelect(nodeType);
    } else {
      addNode(nodeType);
    }
    onOpenChange?.(false);
    setCategoryOpen(false);
  };

  const handleCategoryClick = (e: React.MouseEvent, category: CategoryData) => {
    e.stopPropagation();
    setSelectedCategory(selectedCategory?.id === category.id ? null : category);
  };

  const handleNodeClick = (e: React.MouseEvent, nodeType: string) => {
    e.stopPropagation();
    handleAddNode(nodeType);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button variant="outline" className="fixed top-2 right-2">
            Browse Nodes
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Select Node Type</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {categories.map((category) => (
            <div key={category.id}>
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={(e) => handleCategoryClick(e, category)}
              >
                {category.name}
                <ChevronRight className="h-4 w-4" />
              </Button>
              {selectedCategory?.id === category.id && (
                <div className="mt-4 space-y-2 pl-4">
                  {category.nodes.map((node) => (
                    <div
                      key={node.type}
                      className="rounded-lg border p-4 hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {React.createElement(getIconByName(node.icon), {
                            className: "h-4 w-4",
                          })}
                          <h3 className="font-medium">{node.label}</h3>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleNodeClick(e, node.type)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
