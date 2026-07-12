import { useCallback } from "react";
import { useDialog } from "../../providers/dialog";
import { DialogSearchList } from "../dialog-search-list";
import type { SupportedChatModelId } from "@pneuma/shared";

type ModelsDialgContextProps = {
  models: SupportedChatModelId[];
  onSelectModel: (modelId: SupportedChatModelId) => void;
};

export const ModelsDialogContext = ({
  models,
  onSelectModel,
}: ModelsDialgContextProps) => {
  const dialog = useDialog();

  const handleSelect = useCallback(
    (nextModel: SupportedChatModelId) => {
      onSelectModel(nextModel);
      dialog.close();
    },
    [onSelectModel, dialog],
  );

  return (
    <DialogSearchList
      items={models}
      onSelect={handleSelect}
      filterFn={(model, query) =>
        model.toLowerCase().includes(query.toLowerCase())
      }
      renderItem={(model, isSelected) => (
        <text selectable={false} fg={isSelected ? "black" : "white"}>
          {model}
        </text>
      )}
      getKey={(m) => m}
      placeholder="Search models"
      emptyText="No matching models"
    />
  );
};
