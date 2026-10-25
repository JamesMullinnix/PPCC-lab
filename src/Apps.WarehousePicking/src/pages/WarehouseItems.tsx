import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IColumn } from "@talxis/client-libraries";
import { Lab_warehouseitemsService } from "@/generated/services/Lab_warehouseitemsService";
import { categoryOptionMetadata } from "@/utils/OptionSets";
import {
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import { BoxRegular } from "@fluentui/react-icons";
import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { RecordFormDialog } from "@/components/RecordFormDialog";
import type { FormField } from "@/components/RecordFormFields";
import { useToast } from "@/hooks/use-toast";
import { useStyles } from "@/styles/WarehouseItems.styles";
import { errorText, servicePayload, serviceResult } from "@/utils/ServicePayload";
import { useWarehouseItems, warehouseItemColumns, warehouseItemsQueryKey } from "@/hooks/useWarehouseItems";

// The New Item form: name, SKU, quantity (no negatives) and category are required; the location
// is optional and picked through a RecordLookup (it holds the location's id).
const formFields: FormField[] = [
  { column: { name: "lab_name", displayName: "Name", dataType: "SingleLine.Text", isPrimary: true }, required: true },
  { column: { name: "lab_sku", displayName: "SKU", dataType: "SingleLine.Text" }, required: true },
  { column: { name: "lab_availablequantity", displayName: "Available Quantity", dataType: "Whole.None" }, required: true },
  { column: { name: "lab_category", displayName: "Category", dataType: "OptionSet", metadata: { OptionSet: categoryOptionMetadata } as IColumn["metadata"] }, required: true },
  { column: { name: "lab_locationid", displayName: "Location", dataType: "SingleLine.Text" }, lookupEntity: "lab_warehouselocation" },
];

export default function WarehouseItemsPage() {
  const styles = useStyles();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { rows, locationRecords, error } = useWarehouseItems();

  const createMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      return serviceResult(Lab_warehouseitemsService.create(servicePayload({
        lab_name: values.lab_name,
        lab_sku: values.lab_sku,
        lab_availablequantity: String(values.lab_availablequantity),
        // Option set values come out of the form as strings
        lab_category: Number(values.lab_category),
        ...(values.lab_locationid
          ? { "lab_locationid@odata.bind": `/lab_warehouselocations(${values.lab_locationid})` }
          : {}),
      })));
    },
    onSuccess: async () => {
      // Every list shows the same few records (Pick, Receive and the other tabs keep their own copies
      // for five minutes), so a change makes all of them stale: refetch what is on screen, the rest on its next visit
      await queryClient.invalidateQueries();
      toast.success("Item created successfully");
    },
    onError: (err) => {
      toast.error(errorText(err));
    },
  });

  return (
    <div className={styles.page}>
      <PageHeader
        icon={<BoxRegular />}
        title="Warehouse Items"
        subtitle="Manage your warehouse inventory"
      />

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>Failed to load items: {errorText(error)}</MessageBarBody>
        </MessageBar>
      )}

      <RecordGrid
        rows={rows}
        columns={warehouseItemColumns}
        entityName="lab_warehouseitem"
        rowClassName="warehouse-item-row"
        commands={[{ id: "new", label: "New Item", icon: "Add", onExecute: () => setDialogOpen(true) }]}
        onRefresh={() => queryClient.refetchQueries({ queryKey: warehouseItemsQueryKey })}
      />

      <RecordFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create New Item"
        entityName="lab_warehouseitem"
        fields={formFields}
        lookupRecords={{ lab_locationid: locationRecords }}
        onCreate={(values) => createMutation.mutateAsync(values)}
        pending={createMutation.isPending}
      />
    </div>
  );
}

