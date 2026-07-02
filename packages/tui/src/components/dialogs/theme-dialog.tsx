import { useCallback, useEffect, useRef } from "react";
import { useDialog } from "../../providers/dialog";
import { useTheme } from "../../providers/theme";
import { THEMES, type Theme } from "../theme";
import { DialogSearchList } from "../dialog-search-list";

export const ThemeDialogContent = () => {
  const dialog = useDialog();
  const { setTheme, currentTheme } = useTheme();
  const originaThemeRef = useRef(currentTheme);
  const userConfirmed = useRef(false);

  useEffect(() => {
    return () => {
      if (!userConfirmed.current) {
        setTheme(originaThemeRef.current);
      }
    };
  }, [setTheme]);

  const handleSelect = useCallback(
    (theme: Theme) => {
      userConfirmed.current = true;
      setTheme(theme);
      dialog.close();
    },
    [setTheme, dialog],
  );

  const handleHighlight = useCallback(
    (theme: Theme) => {
      setTheme(theme);
    },
    [setTheme],
  );

  return (
    <DialogSearchList
      items={THEMES}
      onSelect={handleSelect}
      onHighlight={handleHighlight}
      filterFn={(theme, query) =>
        theme.name.toLowerCase().includes(query.toLowerCase())
      }
      renderItem={(theme, isSelected) => (
        <text selectable={false} fg={isSelected ? "black" : "white"}>
          {theme.name === originaThemeRef.current.name
            ? "\u0020\u2022\u0020"
            : "\u0020\u0020\u0020"}
          {theme.name}
        </text>
      )}
      getKey={(theme) => theme.name}
      placeholder="Search themes"
      emptyText="No matching themes"
    />
  );
};
