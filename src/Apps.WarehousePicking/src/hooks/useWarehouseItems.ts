import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { IColumn } from "@talxis/client-libraries";
import { Lab_warehouseitemsService } from "@/generated/services/Lab_warehouseitemsService";
import { Lab_warehouselocationsService } from "@/generated/services/Lab_warehouselocationsService";
import type { Lab_warehouseitems } from "@/generated/models/Lab_warehouseitemsModel";
import type { Lab_warehouselocations } from "@/generated/models/Lab_warehouselocationsModel";
import { categoryOptionMetadata, statusOptions } from "@/utils/OptionSets";
import { serviceResult } from "@/utils/ServicePayload";
import { toNumber } from "@/utils/RecordValues";

export const warehouseItemsQueryKey = ["warehouseItems"] as const;

export const warehouseItemColumns: IColumn[] = [
  { name: "lab_name", displayName: "Name", dataType: "SingleLine.Text", isPrimary: true, visualSizeFactor: 220 },
  { name: "lab_sku", displayName: "SKU", dataType: "SingleLine.Text", visualSizeFactor: 130 },
  { name: "lab_availablequantity", displayName: "Available Qty", dataType: "Whole.None", visualSizeFactor: 120 },
  { name: "lab_category", displayName: "Category", dataType: "OptionSet", visualSizeFactor: 140, metadata: { OptionSet: categoryOptionMetadata } as IColumn["metadata"] },
  { name: "location", displayName: "Location", dataType: "SingleLine.Text", visualSizeFactor: 150 },
  { name: "statecode", displayName: "Status", dataType: "OptionSet", visualSizeFactor: 110, metadata: { OptionSet: statusOptions } as IColumn["metadata"] },
  { name: "createdon", displayName: "Created", dataType: "DateAndTime.DateOnly", visualSizeFactor: 120 },
];

export function useWarehouseItems() {
  const itemsQuery = useQuery({
    queryKey: warehouseItemsQueryKey,
    queryFn: async () => {
      const result = await serviceResult(Lab_warehouseitemsService.getAll({
        select: [
          "lab_warehouseitemid",
          "lab_name",
          "lab_sku",
          "lab_availablequantity",
          "lab_category",
          "_lab_locationid_value",
          "createdon",
          "statecode",
        ],
        orderBy: ["lab_name asc"],
      }));
      return result.data ?? [];
    },
  });

  const locationsQuery = useQuery({
    queryKey: ["warehouseLocations"],
    queryFn: async () => {
      const result = await serviceResult(Lab_warehouselocationsService.getAll({
        select: ["lab_warehouselocationid", "lab_name"],
        orderBy: ["lab_name asc"],
      }));
      return result.data ?? [];
    },
  });

  const locationRecords = useMemo(
    () => (locationsQuery.data ?? []).map((location: Lab_warehouselocations) => ({
      id: location.lab_warehouselocationid,
      name: location.lab_name ?? "",
    })),
    [locationsQuery.data]
  );

  const rows = useMemo(() => {
    if (!itemsQuery.data || !locationsQuery.data) return undefined;
    const locationNames = new Map(locationRecords.map((location) => [location.id, location.name]));
    return itemsQuery.data.map((item: Lab_warehouseitems) => ({
      ...item,
      lab_availablequantity: toNumber(item.lab_availablequantity),
      lab_category: toNumber(item.lab_category),
      statecode: toNumber(item.statecode),
      location: locationNames.get(item._lab_locationid_value ?? "") ?? "",
    }));
  }, [itemsQuery.data, locationsQuery.data, locationRecords]);

  return {
    items: itemsQuery.data,
    rows,
    locationRecords,
    error: itemsQuery.error ?? locationsQuery.error,
  };
}