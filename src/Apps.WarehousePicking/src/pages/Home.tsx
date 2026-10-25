import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Body1, Button, Caption1, MessageBar, MessageBarBody, Title2 } from "@fluentui/react-components";
import { ArrowSwapRegular, HomeRegular, LocationRegular } from "@fluentui/react-icons";
import { PageHeader } from "@/components/PageHeader";
import { RecordGrid } from "@/components/RecordGrid";
import { useWarehouseItems, warehouseItemColumns, warehouseItemsQueryKey } from "@/hooks/useWarehouseItems";
import { useToast } from "@/hooks/use-toast";
import { errorText } from "@/utils/ServicePayload";
import { toNumber } from "@/utils/RecordValues";
import { useStyles } from "@/styles/Home.styles";

export default function HomePage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { items, rows, error } = useWarehouseItems();
  const totalUnits = items?.reduce((total, item) => total + (toNumber(item.lab_availablequantity) ?? 0), 0);

  return (
    <div className={styles.page}>
      <PageHeader
        icon={<HomeRegular />}
        title="Home"
        subtitle="Every warehouse item and its current quantity on hand"
      />

      <section className={styles.overview} aria-label="Inventory summary">
        <div className={styles.metric}>
          <Caption1>Warehouse items</Caption1>
          <Title2>{items ? items.length : "—"}</Title2>
        </div>
        <div className={styles.metric}>
          <Caption1>Units on hand</Caption1>
          <Title2>{totalUnits ?? "—"}</Title2>
        </div>
        <div className={styles.shortcuts}>
          <Button appearance="secondary" icon={<ArrowSwapRegular />} onClick={() => navigate("/transactions")}>
            Transactions
          </Button>
          <Button appearance="secondary" icon={<LocationRegular />} onClick={() => navigate("/locations")}>
            Locations
          </Button>
        </div>
      </section>

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>Failed to load items: {errorText(error)}</MessageBarBody>
        </MessageBar>
      )}

      <section className={styles.inventory} aria-labelledby="home-inventory-heading">
        <div className={styles.inventoryHeading}>
          <Title2 as="h2" id="home-inventory-heading">All items</Title2>
          <Body1 className={styles.hint}>Select an item to view details or record a movement.</Body1>
        </div>
        <RecordGrid
          rows={rows}
          columns={warehouseItemColumns}
          entityName="lab_warehouseitem"
          rowClassName="warehouse-item-row"
          onRefresh={async () => {
            try {
              await queryClient.refetchQueries({ queryKey: warehouseItemsQueryKey });
            } catch (refreshError) {
              toast.error(errorText(refreshError));
            }
          }}
        />
      </section>
    </div>
  );
}