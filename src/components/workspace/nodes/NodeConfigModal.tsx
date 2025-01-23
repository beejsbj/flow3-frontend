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
import { FieldConfig } from "@/components/workspace/types";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  if (!node?.data.config?.fields) return null;

  const { fields } = node.data.config as {
    fields: Record<string, FieldConfig>;
  };

  const generateZodSchema = () => {
    const schemaMap: Record<string, z.ZodType> = {};
    Object.entries(fields).forEach(([fieldName, field]) => {
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

      schemaMap[fieldName] = field.required
        ? fieldSchema
        : fieldSchema.optional();
    });
    return z.object(schemaMap);
  };

  const formSchema = generateZodSchema();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: node.data.config.values,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!node || !node.data.config) return;
    //  node.data.config.values = values;
    updateNodeValues(node.id, values);
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
            {Object.entries(fields).map(([fieldName, field]) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName}
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
