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
import { nodeRegistry, type CategoryData } from "./nodes/registry";
import { useAddNode } from "@/stores/workflow";

export function NodesSheetList() {
  const [selectedCategory, setSelectedCategory] =
    React.useState<CategoryData | null>(null);
  const categories = nodeRegistry.getCategoriesWithNodes();
  const addNode = useAddNode();

  const handleAddNode = (nodeType: string) => {
    // Add node at a default position - you can adjust these values
    addNode(nodeType);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Browse Nodes</Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Node Categories</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {categories.map((category) => (
            <Sheet key={category.id}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.name}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>{category.name}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {category.nodes.map((node) => (
                    <div
                      key={node.type}
                      className="rounded-lg border p-4 hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <node.icon className="h-4 w-4" />
                          <h3 className="font-medium">{node.label}</h3>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleAddNode(node.type)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
