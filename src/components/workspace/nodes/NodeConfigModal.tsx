// src/components/workspace/NodeConfigModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateNodeValues } from "@/stores/workspace";
import { useNode } from "@/stores/workspace";
import { useNodes } from "@xyflow/react";
interface NodeConfigModalProps {
  nodeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NodeConfigModal({
  nodeId,
  open,
  onOpenChange,
}: NodeConfigModalProps) {
  const updateNodeValues = useUpdateNodeValues();
  const node = useNode(nodeId);
  const nodes = useNodes();

  if (!node?.data.config?.schema) return null;

  // Dynamically generate zod schema based on config schema
  const generateZodSchema = () => {
    const schemaMap: Record<string, any> = {};
    node.data.config.schema.forEach((field) => {
      if (field.type === "number") {
        schemaMap[field.name] = z.number();
      } else if (field.type === "string") {
        schemaMap[field.name] = z.string();
      }
    });
    return z.object(schemaMap);
  };

  const formSchema = generateZodSchema();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: node.data.config.values,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateNodeValues(node.id, values);
    onOpenChange(false);
    console.log("nodes", nodes);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {node.data.label}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {node.data.config.schema.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Input
                        type={field.type}
                        placeholder={field.label}
                        {...formField}
                        onChange={(e) => {
                          const value =
                            field.type === "number"
                              ? parseFloat(e.target.value)
                              : e.target.value;
                          formField.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
