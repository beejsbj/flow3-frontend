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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NodeData, FieldConfig } from "@/components/workspace/types";

interface NodeConfigFormProps {
  data: NodeData;
  onSubmit: (values: any) => void;
}

export function NodeConfigForm({ data, onSubmit }: NodeConfigFormProps) {
  const config = data.config;

  if (!config) {
    return null;
  }

  const generateZodSchema = () => {
    const schemaMap: Record<string, z.ZodType> = {};

    config.form?.forEach((field: FieldConfig) => {
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
  const initialValues =
    config.form?.reduce((acc, field) => {
      acc[field.name] = field.value;
      return acc;
    }, {} as Record<string, any>) || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  // Helper function to check if a field should be visible based on its dependencies
  const isFieldApplicable = (field: FieldConfig) => {
    if (!field.dependsOn) return true;
    const dependentValue = form.watch(field.dependsOn.field);
    return dependentValue === field.dependsOn.value;
  };

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {config.form?.map((field) =>
          isFieldApplicable(field) ? (
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
                            <SelectItem key={option.value} value={option.value}>
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
          ) : null
        )}
        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
