// src/components/workspace/NodeConfigModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
import { useNode, useUpdateNodeValues } from "@/stores/workspace";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Node, FieldConfig } from "@/components/workspace/types";

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
  const node = useNode(nodeId) as Node | undefined;
  const updateNodeValues = useUpdateNodeValues();

  if (!node?.data.config?.form) return null;

  const generateZodSchema = () => {
    const schemaMap: Record<string, z.ZodType> = {};
    node?.data?.config?.form?.forEach((field: FieldConfig) => {
      let fieldSchema: z.ZodType;

      switch (field.type) {
        case "number":
          fieldSchema = z.number();
          break;
        case "string":
          fieldSchema = z.string();
          break;
        case "boolean":
          fieldSchema = z.boolean();
          break;
        case "select":
          fieldSchema = z.string();
          break;
        default:
          fieldSchema = z.any();
      }

      schemaMap[field.name] = field.required
        ? fieldSchema
        : fieldSchema.optional();
    });
    return z.object(schemaMap);
  };

  const formSchema = generateZodSchema();

  // Create initial values object from form fields
  const initialValues = node.data.config.form.reduce((acc, field) => {
    acc[field.name] = field.value;
    return acc;
  }, {} as Record<string, any>);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!node || !node.data.config) return;
    updateNodeValues(nodeId, values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {node.data.label}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {node.data.config.form.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      {field.type === "select" ? (
                        <Select
                          value={formField.value}
                          onValueChange={formField.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === "boolean" ? (
                        <Switch
                          checked={formField.value}
                          onCheckedChange={formField.onChange}
                        />
                      ) : (
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
                      )}
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
